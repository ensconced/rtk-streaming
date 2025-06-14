import React from "react";
import { createApi } from "@reduxjs/toolkit/query/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import type {} from "react/jsx-runtime";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";

const decoder = new TextDecoder();

const metaBaseQuery: BaseQueryFn<
  string,
  unknown,
  unknown,
  unknown,
  { response: Response }
> = async (args) => {
  const response = await fetch(args); // This waits for the headers to be received, but not for the body.
  if (!response.ok) return { error: new Error("oh no") };
  return { data: { text: "" }, meta: { response } };
};

const api = createApi({
  reducerPath: "api",
  baseQuery: metaBaseQuery,
  endpoints: (builder) => ({
    getSlowStream: builder.query<{ text: string }, void>({
      query: () => "/api/slow-stream",
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded }) {
        try {
          const { meta } = await cacheDataLoaded;
          if (!meta?.response.body) return;
          for await (const chunk of meta.response.body) {
            updateCachedData((draft) => {
              draft.text += decoder.decode(chunk);
            });
          }
        } catch {
          // nothing for now...
        }
      },
    }),
  }),
});

const store = configureStore({
  reducer: { [api.reducerPath]: api.reducer },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});

function SlowStreamViewer() {
  const { data } = api.useGetSlowStreamQuery();
  return <pre style={{ whiteSpace: "pre-wrap" }}>{data?.text}</pre>;
}

export default function App() {
  return (
    <Provider store={store}>
      <SlowStreamViewer />
    </Provider>
  );
}
