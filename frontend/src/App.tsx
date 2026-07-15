import { useEffect } from "react";

import apiClient from "./api/axios";

export default function App() {
  useEffect(() => {
    async function fetchMe() {
      try {
        const response = await apiClient.get("/auth/me");

        console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchMe();
  }, []);

  return <h1>Issue Tracker</h1>;
}
