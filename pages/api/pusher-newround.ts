import Pusher from "pusher";

export const pusher = new Pusher({
  appId: process.env.APP_ID,
  key: process.env.API_KEY,
  secret: process.env.SECRET,
  cluster: process.env.NEXT_PUBLIC_CLUSTER,
  useTLS: true
});

export default async function handler(req, res) {
  const notif = req.body;

  const response = await pusher.trigger("history", "restart-game", {
    notif,
  });

  res.json({ message: "completed" });
}
