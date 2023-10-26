import { serve } from "https://deno.land/std@0.202.0/http/server.ts";
import { configure, renderFile } from "https://deno.land/x/eta@v2.2.0/mod.ts";
import * as messageService from "./services/messageService.js";

configure({
  views: `${Deno.cwd()}/views/`,
});

const responseDetails = {
  headers: { "Content-Type": "text/html;charset=UTF-8" },
};

const redirectTo = (path) => {
  return new Response(`Redirecting to ${path}.`, {
    status: 303,
    headers: {
      "Location": path,
    },
  });
};

const deleteMessage = async (request) => {
  const url = new URL(request.url);
  const parts = url.pathname.split("/");
  const id = parts[2];
  await messageService.deleteById(id);

  return redirectTo("/");
};

const addMessage = async (request) => {
  const formData = await request.formData();

  const sender = formData.get("sender");
  const message = formData.get("message");

  await messageService.create(sender, message);

  return redirectTo("/");
};

const listMessages = async (request) => {
  const data = {
    messages: await messageService.findAll(),
  };

  return new Response(await renderFile("index.eta", data), responseDetails);
};

const handleRequest = async (request) => {
  const url = new URL(request.url);
  if (request.method === "POST" && url.pathname.startsWith("/delete/")) {
    return await deleteMessage(request);
  } else if (request.method === "POST") {
    return await addMessage(request);
  } else {
    return await listMessages(request);
  }
};

serve(handleRequest, { port: 7777 });