import React, { createContext, useContext, useEffect, useState } from "react";
import { Hub } from "aws-amplify/utils";
import { Schema } from "@/amplify/data/resource";
import { getCurrentUser } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { generateClient } from "aws-amplify/api";

type AuthContextType = {
  cognitoUser?: string | null;
  fetchedUser?: Schema["User"] | null;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  cognitoUser: null,
  fetchedUser: null,
  loading: true,
});

const client = generateClient<Schema>();

const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [cognitoUser, setCognitoUser] = useState<string | null>(null);
  const [fetchedUser, setFetchedUser] = useState<Schema["User"] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchUser = async (phoneNumber: string) => {
    try {
      const { data } = await client.models.User.list({
        filter: { phoneNumber: { eq: phoneNumber } },
      });
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
      setCognitoUser(authUser.userId);
      if (authUser.signInDetails?.loginId) {
        await fetchUser(authUser.signInDetails.loginId);
      } else {
        throw new Error("User not found");
      }
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
      switch (payload.event) {
        case "signedIn":
        case "tokenRefresh":
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => useContext(AuthContext);

export default AuthContextProvider;
