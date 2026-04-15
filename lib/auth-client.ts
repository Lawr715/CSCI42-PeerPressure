import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient({
    /** 
     * On Vercel, Better-Auth client works best when baseURL is left empty,
     * as it will automatically use the current window origin.
     */
})
export const { signUp, signIn, signOut, useSession } = authClient;