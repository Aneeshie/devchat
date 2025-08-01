"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { Provider } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { GithubIcon, MessageCircleCode, StarIcon } from "lucide-react";
import Text from "@/components/ui/text";
import { registerWithEmail } from "@/actions/registerWithEmail";

const AuthPage = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const getCurrUser = async () => {
      const client = supabaseBrowserClient();
      const {
        data: { session },
      } = await client.auth.getSession();

      if (session) {
        return router.push("/");
      }
    };

    getCurrUser();
    setIsMounted(true);
  }, [router]);

  const formSchema = z.object({
    email: z.email().min(2, { message: "Email must be 2 characters" }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsAuthenticating(true);
    const res = await registerWithEmail(values);
    const { error } = JSON.parse(res);
    setIsAuthenticating(false);
    if (error) {
      console.log("Sign In Error: " + error);
      return;
    }
  }

  async function gitAuth(provider: Provider) {
    setIsAuthenticating(true);
    const client = supabaseBrowserClient();
    await client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
    setIsAuthenticating(false);
  }

  if (!isMounted) return null;

  return (
    <div className="min-h-screen p-5 grid text-center place-content-center bg-white">
      <div className="max-w-[450px]">
        <div className="flex justify-center items-center gap-3 mb-4">
          <MessageCircleCode size={30} />
          <Text variant="h2">DevChat</Text>
        </div>

        <Text variant="h2" className="mb-3">
          Sign in to your Slackzz
        </Text>

        <Text variant="p" className="opacity-90 mb-7">
          We suggest using the email address that you use at work
        </Text>

        <div className="flex flex-col space-y-4">
          <Button
            disabled={isAuthenticating}
            variant="outline"
            className="py-6 border-2 flex space-x-3"
            onClick={() => gitAuth("github")}
          >
            <GithubIcon size={30} />
            <Text className="text-xl" variant="p">
              Sign in with Github
            </Text>
          </Button>
        </div>

        <div>
          <div className="flex items-center my-6">
            <div className="mr-[10px] flex-1 border-t bg-neutral-300" />
            <Text variant="p">OR</Text>
            <div className="ml-[10px] flex-1 border-t bg-neutral-300" />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <fieldset disabled={isAuthenticating}>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="name@work-email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  variant="secondary"
                  className="bg-black hover:bg-gray-900/90 w-full my-5 text-white"
                  type="submit"
                >
                  <Text variant="p">Sign In With Email</Text>
                </Button>

                <div className="px-5 py-4 bg-gray-100 rounded-sm">
                  <div className="text-gray-500 flex items-center space-x-3">
                    <StarIcon />
                    <Text variant="p">we will email you magic link hehe</Text>
                  </div>
                </div>
              </fieldset>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
