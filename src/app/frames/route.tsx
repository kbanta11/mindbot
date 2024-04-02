import { Button } from "frames.js/core";
import { frames } from "./frames";
import { UrlObject } from "url";
 
const handleRequest = frames(async (ctx) => {
  const base = new URL(
    "/frames",
    process.env.NEXT_PUBLIC_HOST
      ? `https://${process.env.NEXT_PUBLIC_HOST}`
      : "http://localhost:3000"
  )
  return {
    image: (
      <span>
        {ctx.pressedButton
          ? `I clicked ${ctx.searchParams.value}`
          : `Click some button`}
      </span>
    ),
    buttons: [
      <Button key='yes' action="post" target={`${base}/?value=Yes`}>
        Say Yes
      </Button>,
      <Button key='no' action="post" target={`${base}/?value=No`}>
        Say No
      </Button>,
    ],
  };
});
 
export const GET = handleRequest;
export const POST = handleRequest;