import { Button } from "frames.js/core";
import { frames } from "./frames";
import { UrlObject } from "url";
import { onchainDataFramesjsMiddleware, init, Features } from "@airstack/frames";
import { FramesMiddleware } from "frames.js/types";
require('dotenv').config();

init(process.env.NEXT_PUBLIC_AIRSTACK_API_KEY as string);


const handleRequest = frames(async (ctx) => {
  const isLearn = ctx.searchParams.learn === 'true' ? true : false;
  const joined = ctx.searchParams.join === 'true' ? true : false;
  const leaving = ctx.searchParams.leave === 'true' ? true : false;
  const base = new URL(
    "/frames",
    process.env.NEXT_PUBLIC_HOST
      ? `https://${process.env.NEXT_PUBLIC_HOST}`
      : "http://localhost:3000"
  )

  if (isLearn) {
    return {
      image: (
        <div tw='flex' style={{  padding: '1rem', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
          <div style={{ fontSize: '4rem' }}>WTH is this?</div>
          <div style={{ textAlign: 'center'}}>
            A Nudge of Gratitude is an experiment.
          </div>
          <div style={{ textAlign: 'center'}}>
            Join to get a once daily prompt from MindBot to share something that brings you joy. Reply to MindBot's cast to share. MindBot will track streaks of gratitude and might occasionally remind you of something that made you happy!
          </div>
          <div>Start by sharing something to join!</div>
          <div>Follow @mindbot to receive notifications</div>
        </div>
      ),
      textInput: 'What are you grateful for?',
      buttons: [
        <Button key="join" action="post" target={`${base}/?join=true`}>Join</Button>,
        <Button key="leave" action="post" target={`${base}/?leave=true`}>Leave</Button>
      ]
    }
  }

  if (joined) {
    // add user info to db
    console.log(`FID: ${ctx.message.requesterFid} (@${ctx.userDetails?.profileName}) - ${ctx.message.inputText}`);
    const response = fetch(`${base.toString().replace('/frames', '/api')}/add-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fid: ctx.message.requesterFid,
        name: ctx.userDetails?.profileName,
        message: ctx.message.inputText
      })
    })

    return {
      image: (
        <div tw='flex' style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ fontSize: '4rem' }}>
            Thanks for joining!
          </div>
          <div>
            MindBot really hopes to help you remember happy moments :)
          </div>
        </div>
      ),
    }
  }

  if (leaving) {
    // add user info to db
    const response = fetch(`${base.toString().replace('/frames', '/api')}/remove-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fid: ctx.message.requesterFid,
        name: ctx.userDetails?.profileName,
      })
    });

    return {
      image: (
        <div tw='flex' style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ fontSize: '4rem' }}>
            Sorry to see you go :(
          </div>
          <div>
            MindBot wishes you well!
          </div>
        </div>
      ),
    }
  }

  return {
    image: `${base.toString().replace('frames', 'api')}/start-img`,
    imageOptions: {
      aspectRatio: '1:1'
    },
    buttons: [
      <Button key='yes' action="post" target={`${base}/?learn=true`}>
        Learn ➡️
      </Button>,
    ],
  };
}, {
  middleware: [
      onchainDataFramesjsMiddleware({
          apiKey: process.env.NEXT_PUBLIC_AIRSTACK_API_KEY as string,
          features: [Features.USER_DETAILS],
      }) as FramesMiddleware<any, any>
  ]
});
 
export const GET = handleRequest;
export const POST = handleRequest;