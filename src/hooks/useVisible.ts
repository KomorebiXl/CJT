export const useVisible = () => {
  const visible = ref<boolean>(false)

  const setVisible = (value: boolean) => (visible.value = value)

  return { visible, setVisible }
}
