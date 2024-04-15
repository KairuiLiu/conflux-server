export function genSuccessResponse(data: any, msg = 'success') {
  return {
    code: 0,
    data,
    msg,
  };
}

export function genErrorResponse(msg: string = 'error', code: number = 1) {
  return {
    code,
    msg,
  };
}
