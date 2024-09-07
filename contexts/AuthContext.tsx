"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Hub } from "aws-amplify/utils";
import { Schema } from "@/amplify/data/resource";
import { getCurrentUser } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { generateClient } from "aws-amplify/api";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

type AuthContextType = {
  cognitoUser?: string | null;
  fetchedUser?: Schema["User"]["type"] | null;
  loading: boolean;
  checkUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  cognitoUser: null,
  fetchedUser: null,
  loading: true,
  checkUser: async () => {},
});

const client = generateClient<Schema>();

// Has to be called client side
Amplify.configure(outputs);

const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [cognitoUser, setCognitoUser] = useState<string | null>(null);
  const [fetchedUser, setFetchedUser] = useState<Schema["User"]["type"] | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchUser = async (phoneOrEmail: string) => {
    try {
      const { data, errors } = await client.models.User.list({
        filter: {
          or: [
            { phoneNumber: { eq: phoneOrEmail } },
            { email: { eq: phoneOrEmail } },
          ],
        },
      });
      console.log("fetchUser", data, errors);
      if (data && data.length > 0) {
        setFetchedUser(data[0]);
        router.push("/dashboard");
      } else {
        setFetchedUser(null);
        router.push("/");
      }
    } catch (err) {
      console.warn("error fetchUser", err);
      setFetchedUser(null);
      router.push("/");
    }
  };

  const checkUser = async () => {
    setLoading(true);
    try {
      const authUser = await getCurrentUser();
      console.log("authUser", authUser);
      setCognitoUser(authUser.userId);
      if (authUser.signInDetails?.loginId) {
        console.log(
          "authUser.signInDetails.loginId",
          authUser.signInDetails.loginId
        );
        await fetchUser(authUser.signInDetails.loginId);
      } else {
        throw new Error("User not found");
      }
      router.push("/dashboard"); // Redirect to dashboard after successful sign in
    } catch (error) {
      console.warn("error checkUser", error);
      setCognitoUser(null);
      setFetchedUser(null);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const authListener = Hub.listen("auth", ({ payload }) => {
      console.log("payload", payload);
      switch (payload.event) {
        case "signedIn":
          checkUser();
          break;
        case "tokenRefresh":
          checkUser();
          break;
        case "signInWithRedirect":
          checkUser();
          break;
        case "signedOut":
          setCognitoUser(null);
          setFetchedUser(null);
          router.push("/");
          break;
      }
    });

    return () => {
      authListener();
    };
  }, []);

  useEffect(() => {
    checkUser();
  }, []);

  const value = {
    cognitoUser,
    fetchedUser,
    loading,
    checkUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => useContext(AuthContext);

export default AuthContextProvider;
