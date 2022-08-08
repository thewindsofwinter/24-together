import Pusher from "pusher";

export const pusher = new Pusher({
    appId: process.env.APP_ID,
    key: process.env.API_KEY,
    secret: process.env.SECRET,
    cluster: process.env.NEXT_PUBLIC_CLUSTER,
    useTLS: true
});

export default async function handler(req, res) {
    const { tag, color, message } = req.body;

    const response = await pusher.trigger("history", "send-chat", {
        tag,
        color,
        message,
    });


    res.json({ message: "completed" });
}
