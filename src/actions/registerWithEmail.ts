"use server"

import { supabaseServerClient } from "@/utils/supabase/server";

export async function registerWithEmail({email}:{email:string}){
  const supabase = await supabaseServerClient();

  const currOrigin = process.env.NEXT_PUBLIC_CURRENT_ORIGIN

  const res = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: currOrigin
    }
  });

  return JSON.stringify(res);
}