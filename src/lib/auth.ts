/**
 *  Auth is perhaps a strong word for what we're doing here
 */

export async function verifySharedPassword(input: string) {
  return input === process.env.SHARED_PASSWORD;
}
