export function getErrMsg(err: any) {
  return err?.response?.data?.detail || err?.message || 'Something went wrong';
}
