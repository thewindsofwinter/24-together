import Pusher from "pusher";

export const pusher = new Pusher({
    appId: process.env.APP_ID,
    key: process.env.API_KEY,
    secret: process.env.SECRET,
    cluster: process.env.NEXT_PUBLIC_CLUSTER,
    useTLS: true
});

export default async function handler(req, res) {
    const { msg, sender } = req.body;

    const response = await pusher.trigger("history", "send-chat", {
        msg,
        sender,
    });


    res.json({ message: "completed" });
}
