import java.lang.reflect.*;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import com.zjsc.ras.assessment.client.DeepSeekClient;
import com.zjsc.ras.assessment.config.DeepSeekProperties;
import com.zjsc.ras.assessment.controller.AiTestCaseController;
import com.zjsc.ras.assessment.domain.*;
import com.zjsc.ras.assessment.domain.dto.*;
import com.zjsc.ras.assessment.domain.vo.*;
import com.zjsc.ras.assessment.mapper.*;
import com.zjsc.ras.assessment.service.*;
import com.zjsc.ras.assessment.service.impl.*;
import com.zjsc.ras.assessment.task.AiTestCaseTaskManager;
import com.zjsc.ras.common.exception.CustomException;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.SimpleTransactionStatus;

/** Real service/controller/task logic with in-memory ports. No AI, database or Spring server. */
public class AiTestCaseFeedbackRegression {
    interface Port { Object call(String method, Object[] args) throws Throwable; }
    @SuppressWarnings("unchecked")
    static <T> T mock(Class<T> type, Port port) {
        return (T) Proxy.newProxyInstance(type.getClassLoader(), new Class<?>[]{type}, (p, m, a) -> {
            Object value = port.call(m.getName(), a == null ? new Object[0] : a);
            return value == null && m.getReturnType() == int.class ? 0 : value;
        });
    }
    static void inject(Object target, String name, Object value) throws Exception {
        Class<?> type = target.getClass();
        while (type != null) {
            try { Field f = type.getDeclaredField(name); f.setAccessible(true); f.set(target, value); return; }
            catch (NoSuchFieldException e) { type = type.getSuperclass(); }
        }
        throw new NoSuchFieldException(name);
    }
    static Object invoke(Object target, String name, Class<?>[] types, Object... args) throws Exception {
        Method m = target.getClass().getDeclaredMethod(name, types); m.setAccessible(true);
        try { return m.invoke(target, args); }
        catch (InvocationTargetException e) {
            if (e.getCause() instanceof RuntimeException) throw (RuntimeException)e.getCause();
            throw e;
        }
    }
    static void check(boolean condition, String message) { if (!condition) throw new AssertionError(message); }
    static void blocked(Runnable action) {
        try { action.run(); throw new AssertionError("Expected business rejection"); }
        catch (CustomException expected) { }
    }
    static List<String> ids(List<AiFunctionPoint> rows) {
        List<String> ids = new ArrayList<>(); for (AiFunctionPoint p : rows) ids.add(p.getId()); return ids;
    }
    static AiFunctionPoint point(String id, String resultId, String status) {
        AiFunctionPoint p = new AiFunctionPoint(); p.setId(id); p.setResultId(resultId); p.setSubjectId("P");
        p.setSourceHash("hash"); p.setPointType("1"); p.setName("操作" + id); p.setStatus(status); return p;
    }
    static class Points extends AiFunctionPointServiceImpl {
        @Override public AiTestCaseMaterial buildMaterial(AssetAcceptanceResultVo result) {
            AiTestCaseMaterial m = new AiTestCaseMaterial(); m.setSourceHash(result.getItemDescription());
            m.setItemText(result.getItem()); return m;
        }
    }
    static class Model extends DeepSeekClient {
        int calls; boolean fail; String prompt; String schema; Runnable duringCall;
        Model() { super(new DeepSeekProperties()); }
        @Override public String chatForJson(String system, String user, SamplingParams sampling, AiCredentials credentials) {
            calls++; prompt = user; schema = system;
            if (duringCall != null) duringCall.run();
            if (fail) throw new IllegalStateException("simulated AI failure");
            return "{\"step\":\"执行确认范围\",\"dataRows\":[]}";
        }
    }
    static class Fixture {
        final Points points = new Points();
        final Map<String, AssetAcceptanceResultVo> results = new LinkedHashMap<>();
        final Map<String, List<AiFunctionPoint>> rows = new HashMap<>();
        final List<AssetAiTestCase> writes = new ArrayList<>();
        final List<String> readyCalls = new ArrayList<>();
        final Model model = new Model();
        int deletes; boolean dbFail; boolean cleanupFail;
        final Map<String, List<String>> successes = new HashMap<>();
        final Map<String, List<AssetAiTestCase>> previous = new HashMap<>();
        final IAssetAcceptanceResultService resultService;
        final AiFunctionPointMapper mapper;
        final AssetAiTestCaseMapper cases;
        final AiTestCaseServiceImpl service = new AiTestCaseServiceImpl();
        final AiTestCaseTaskManager manager = new AiTestCaseTaskManager();
        Fixture() throws Exception {
            resultService = mock(IAssetAcceptanceResultService.class, (m,a) -> {
                if (m.equals("selectAssetAcceptanceResultVoById")) return results.get(a[0]);
                if (m.equals("selectAssetAcceptanceResultVoList")) return new ArrayList<>(results.values());
                return null;
            });
            mapper = mock(AiFunctionPointMapper.class, (m,a) -> {
                if (m.equals("lockResult")) return results.containsKey(a[0]) ? a[0] : null;
                if (m.equals("selectByResultId")) { readyCalls.add((String)a[0]); return rows.getOrDefault(a[0], Collections.emptyList()); }
                if (m.equals("markDeletedByResultId")) { deletes++; rows.remove(a[0]); return 1; }
                if (m.equals("insertBatch")) {
                    @SuppressWarnings("unchecked") List<AiFunctionPoint> list = (List<AiFunctionPoint>)a[0];
                    rows.put(list.get(0).getResultId(), list); return list.size();
                }
                return Collections.emptyList();
            });
            cases = mock(AssetAiTestCaseMapper.class, (m,a) -> {
                if (m.equals("upsert")) {
                    if (dbFail) throw new IllegalStateException("db failed");
                    writes.add((AssetAiTestCase)a[0]); return 1;
                }
                if (m.equals("selectResultIdsBySubjectId")) return successes.getOrDefault(a[1], Collections.emptyList());
                if (m.equals("selectByResultIds")) return previous.getOrDefault(a[1], Collections.emptyList());
                if (m.equals("deleteByResultIds")) {
                    if (cleanupFail) throw new IllegalStateException("delete failed");
                    check("simple".equals(a[1]), "cleanup crossed versions"); return 1;
                }
                return null;
            });
            inject(points, "aiFunctionPointMapper", mapper);
            inject(points, "assetAcceptanceResultService", resultService);
            inject(service, "aiFunctionPointService", points);
            inject(service, "assetAcceptanceResultService", resultService);
            inject(service, "assetAiTestCaseMapper", cases);
            inject(service, "deepSeekClient", model);
            inject(service, "deepSeekProperties", new DeepSeekProperties());
            inject(service, "aiFunctionPointMapper", mapper);
            PlatformTransactionManager tx = mock(PlatformTransactionManager.class,
                    (m,a) -> m.equals("getTransaction") ? new SimpleTransactionStatus() : null);
            inject(service, "transactionManager", tx);
            inject(points, "transactionManager", tx);
            inject(service, "aiSkillMapper", mock(AiSkillMapper.class, (m,a) -> null));
            inject(service, "aiUserConfigService", mock(IAiUserConfigService.class, (m,a) -> credentials()));
            inject(manager, "aiFunctionPointService", points);
            inject(manager, "assetAcceptanceResultService", resultService);
            inject(manager, "assetAiTestCaseMapper", cases);
            inject(manager, "aiFunctionPointMapper", mapper);
        }
        AssetAcceptanceResultVo result(String id) {
            AssetAcceptanceResultVo result = new AssetAcceptanceResultVo(); result.setId(id); result.setSubjectId("P");
            result.setItem("测试" + id); result.setItemDescription("hash"); result.setFeature("1"); result.setTitleFlag("0");
            results.put(id, result); return result;
        }
        void ready(String id) { result(id); rows.put(id, new ArrayList<>(Arrays.asList(point(id+"-1", id, "1")))); }
        @SuppressWarnings("unchecked") List<String> pending(String version) throws Exception {
            AiTestCaseGenerateDTO dto = new AiTestCaseGenerateDTO(); dto.setSubjectId("P"); dto.setFeature("1"); dto.setCaseType(version);
            return (List<String>) invoke(manager, "collectItemIds", new Class<?>[]{AiTestCaseGenerateDTO.class, boolean.class}, dto, false);
        }
    }
    static AiCredentials credentials() { return new AiCredentials("mock-key", null, false); }

    static void ownership() throws Exception {
        Fixture f = new Fixture(); f.ready("A"); f.ready("B");
        List<AiFunctionPoint> oldB = f.rows.get("B");
        blocked(() -> f.points.saveReview("B", f.rows.get("A"), ids(oldB)));
        AiFunctionPoint foreignId = point("A-1", "B", "1");
        blocked(() -> f.points.saveReview("B", Arrays.asList(foreignId), ids(oldB)));
        AiFunctionPoint forged = point("B-1", "B", "1"); forged.setSourceHash("forged");
        blocked(() -> f.points.saveReview("B", Arrays.asList(forged), ids(oldB)));
        check(f.deletes == 0 && f.rows.get("B") == oldB, "rejection damaged target");
        AiFunctionPoint added = point(null, "B", "0"); added.setSourceHash(null);
        List<AiFunctionPoint> saved = f.points.saveReview("B", Arrays.asList(oldB.get(0), added), ids(oldB));
        check(saved.size() == 2 && "hash".equals(saved.get(1).getSourceHash()), "manual new row has no server hash");
        check(saved.get(0).getId() != null && !saved.get(0).getId().equals(oldB.get(0).getId()), "snapshot IDs not advanced");
        int deleted = f.deletes;
        blocked(() -> f.points.saveReview("B", oldB, ids(oldB)));
        check(f.deletes == deleted, "stale snapshot overwrote latest");
        f.results.get("B").setItemDescription("new-hash");
        blocked(() -> f.points.saveReview("B", saved, ids(saved)));
        check(f.deletes == deleted, "changed material was accepted");
        System.out.println("PASS #2 ownership/hash/new-row/stale-snapshot zero-write rejection");
    }
    static void gates() throws Exception {
        Fixture f = new Fixture(); f.result("A");
        for (String version : Arrays.asList("detail", "simple")) {
            blocked(() -> f.service.expandOne("A", credentials(), version));
            check(f.model.calls == 0 && f.writes.isEmpty(), "business rejection became degraded/downloadable record");
        }
        f.ready("A"); f.rows.get("A").add(point("A-2", "A", "0"));
        blocked(() -> f.service.expandOne("A", credentials(), "detail"));
        blocked(() -> f.service.expandOne("A", credentials(), "simple"));
        f.rows.get("A").get(1).setStatus("1"); f.results.get("A").setItemDescription("new-hash");
        blocked(() -> f.service.expandOne("A", credentials(), "simple"));
        f.ready("A"); f.result("B");
        blocked(() -> f.service.regenerate(Arrays.asList("A", "B")));
        check(f.model.calls == 0 && f.writes.isEmpty(), "sync batch was partially generated before rejection");
        f.model.fail = true;
        Map<String,Object> degraded = f.service.expandOne("A", credentials(), "detail");
        check(Integer.valueOf(2).equals(degraded.get("status")) && f.writes.size() == 1, "true AI failure did not degrade");
        AssetAiTestCase good = new AssetAiTestCase(); good.setStatus(1); good.setExpansionJson("{\"step\":\"previous\"}");
        f.previous.put("detail", Arrays.asList(good));
        check(Integer.valueOf(3).equals(f.service.expandOne("A", credentials(), "detail").get("status")), "successful previous record not retained");
        check(f.writes.size() == 1, "AI failure overwrote successful previous record");
        f.model.fail = false; f.dbFail = true;
        try { f.service.expandOne("A", credentials(), "detail"); throw new AssertionError("db failure swallowed"); }
        catch (IllegalStateException expected) { check("db failed".equals(expected.getMessage()), "unexpected failure"); }
        System.out.println("PASS #3 business gate outside degradation; sync preflight; real model failure preserve/degrade; DB failure propagates");
    }
    static void readiness() throws Exception {
        Fixture f = new Fixture(); f.ready("A"); f.ready("B");
        f.rows.get("B").add(point("pending", "B", "0"));
        try { f.pending("detail"); throw new AssertionError("partial confirmation passed batch"); }
        catch (CustomException expected) { check(expected.getMessage().contains("2 个测试项，其中 1"), "missing whole-batch counts"); }
        f.successes.put("detail", Arrays.asList("B")); f.readyCalls.clear();
        check(f.pending("detail").equals(Arrays.asList("A")), "increment selected wrong pending set");
        check(!f.readyCalls.contains("B"), "increment revalidated previous success");
        f.results.get("B").setItemDescription("changed");
        check(f.pending("detail").equals(Arrays.asList("A")), "changed successful B should remain skipped");
        try { f.pending("simple"); throw new AssertionError("detail success incorrectly skipped simple"); }
        catch (CustomException expected) { }
        f.rows.get("A").add(point("removed", "A", "0")); f.rows.get("A").get(1).setPointType("0");
        blocked(() -> f.service.expandOne("A", credentials(), "simple"));
        f.rows.get("A").get(1).setStatus("2");
        check(Integer.valueOf(1).equals(f.service.expandOne("A", credentials(), "simple").get("status")), "reviewed simple failed");
        check(f.model.prompt.contains("操作A-1") && f.model.prompt.contains("全部合并为一条"), "simple ignored reviewed list");
        check(f.model.prompt.contains("整个测试项仅一条用例") && f.model.schema.contains("唯一功能范围"), "simple fallback/schema not constrained");
        check("simple".equals(f.writes.get(0).getCaseType()), "simple write crossed version");
        Fixture changing = new Fixture(); changing.ready("A");
        changing.model.duringCall = () -> changing.results.get("A").setItemDescription("new hash");
        blocked(() -> changing.service.expandOne("A", credentials(), "simple"));
        check(changing.writes.isEmpty(), "in-flight changed material committed stale output");
        changing.ready("A");
        changing.model.duringCall = () -> changing.rows.put("A", Arrays.asList(point("new-review-id", "A", "1")));
        blocked(() -> changing.service.expandOne("A", credentials(), "detail"));
        check(changing.writes.isEmpty(), "in-flight changed review committed stale output");
        System.out.println("PASS #4 full review + hash gates, pending-only incremental, version isolation, simple reviewed scope");
    }
    static void taskAndCleanup() throws Exception {
        Fixture f = new Fixture();
        Class<?> type = AiTestCaseTaskManager.AiTestCaseTask.class;
        Constructor<?> ctor = type.getDeclaredConstructor(String.class, String.class, int.class, String.class, String.class, String.class, String.class);
        ctor.setAccessible(true); Object task = ctor.newInstance("P", "generate", 2, "1", "sub", "system", "simple");
        @SuppressWarnings("unchecked") Map<String,Object> snap = (Map<String,Object>)invoke(task, "snapshot", new Class<?>[0]);
        check("simple".equals(snap.get("caseType")) && "sub".equals(snap.get("subFeature")) && "system".equals(snap.get("subsystem")) && snap.get("taskId") != null, "snapshot lost download context");
        Object docTask = ctor.newInstance("P", "generate", 1, "8", null, null, "detail");
        @SuppressWarnings("unchecked") Map<String,Object> docSnap = (Map<String,Object>)invoke(docTask, "snapshot", new Class<?>[0]);
        check("8".equals(docSnap.get("feature")), "docset snapshot indistinguishable");
        invoke(task, "trackWritten", new Class<?>[]{String.class}, "written-A");
        invoke(task, "requestStop", new Class<?>[0]); f.cleanupFail = true;
        check(Boolean.FALSE.equals(invoke(task, "completeIfNotStopped", new Class<?>[]{String.class}, (Object)null)), "accepted stop slipped into success");
        Field tasksField = AiTestCaseTaskManager.class.getDeclaredField("tasks"); tasksField.setAccessible(true);
        @SuppressWarnings("unchecked") Map<String,Object> tasks = (Map<String,Object>)tasksField.get(f.manager); tasks.put("P", task);
        inject(task, "cleanupPending", true);
        check("running".equals(f.manager.stopTask("P").get("status")), "in-progress cleanup was retried concurrently");
        try { invoke(f.manager, "cleanupStoppedRun", new Class<?>[]{type, String.class, String.class}, task, "generate", "simple"); throw new AssertionError("cleanup failure swallowed"); }
        catch (CustomException expected) { check(expected.getMessage().contains("尚未全部作废"), "misleading cleanup error"); }
        invoke(task, "markFailed", new Class<?>[]{String.class}, "cleanup failed");
        @SuppressWarnings("unchecked") Map<String,Object> failed = (Map<String,Object>)invoke(task, "snapshot", new Class<?>[0]);
        check("failed".equals(failed.get("status")) && Boolean.TRUE.equals(failed.get("cleanupPending")), "cleanup claimed stopped");
        AiTestCaseGenerateDTO dto = new AiTestCaseGenerateDTO(); dto.setSubjectId("P"); dto.setFeature("1");
        blocked(() -> f.manager.startTask(dto, "user"));
        f.cleanupFail = false;
        Map<String,Object> retried = f.manager.stopTask("P");
        check("stopped".equals(retried.get("status")) && Boolean.FALSE.equals(retried.get("cleanupPending")), "retry did not clear pending cleanup");
        Object finished = ctor.newInstance("P", "generate", 0, "1", null, null, "detail");
        invoke(finished, "completeIfNotStopped", new Class<?>[]{String.class}, (Object)null);
        check(Boolean.FALSE.equals(invoke(finished, "requestStop", new Class<?>[0])), "finished task accepted late stop");
        System.out.println("PASS #7 task metadata + extra cleanup failure/blocked replacement/idempotent retry");
    }
    static void docDownload() throws Exception {
        Fixture f = new Fixture(); f.ready("A");
        AiTestCaseController controller = new AiTestCaseController();
        inject(controller, "assetDocumentService", mock(IAssetDocumentService.class, (m,a) -> Collections.emptyList()));
        inject(controller, "aiTestCaseService", mock(IAiTestCaseService.class, (m,a) -> null));
        try { invoke(controller, "buildDocSetPayload", new Class<?>[]{String.class, List.class}, "P", new ArrayList<>()); throw new AssertionError("docset without steps exported"); }
        catch (CustomException expected) { check(expected.getMessage().contains("尚未生成文档集"), "wrong gate"); }
        inject(controller, "riskSubjectService", mock(IRiskSubjectService.class, (m,a) -> new RiskSubjectVo()));
        inject(controller, "assetAcceptanceSubsystemService", mock(IAssetAcceptanceSubsystemService.class, (m,a) -> Collections.emptyList()));
        AssetAcceptanceResultVo doc = new AssetAcceptanceResultVo(); doc.setFeature("8"); doc.setId("doc");
        inject(controller, "assetAcceptanceResultService", mock(IAssetAcceptanceResultService.class, (m,a) ->
                "8".equals(((AssetAcceptanceResultDTO)a[0]).getFeature()) ? Arrays.asList(doc) : new ArrayList<>(f.results.values())));
        AssetAiTestCase record = new AssetAiTestCase(); record.setResultId("A");
        inject(controller, "assetAiTestCaseMapper", mock(AssetAiTestCaseMapper.class, (m,a) -> Arrays.asList(record)));
        // Null response proves rejection occurs before writing a document or setting response headers.
        blocked(() -> controller.download("P", null, null, null, "detail", null));
        blocked(() -> controller.download("P", "8", null, null, "detail", null));
        System.out.println("PASS extra shared docset payload gate (single and appended export use same builder)");
    }
    public static void main(String[] args) throws Exception {
        String group = args.length == 0 ? "all" : args[0];
        if (group.equals("all") || group.equals("2")) ownership();
        if (group.equals("all") || group.equals("3")) gates();
        if (group.equals("all") || group.equals("4")) readiness();
        if (group.equals("all") || group.equals("7")) taskAndCleanup();
        if (group.equals("all") || group.equals("extra")) docDownload();
    }
}
