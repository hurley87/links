// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  status: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { taskId } = req.body;
  console.log(taskId);

  const status = await fetch(
    `https://relay.gelato.digital/tasks/status/0xa8df42493636754c1d276c31458fcaf086a317789568b92aeee4d1dc91218fdf`,
    {
      method: 'GET',
    }
  )
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      return data;
    })
    .catch((err) => {
      console.log(err);
    });
  console.log(status);

  res.status(200).json({ status: 'John Doe' });
}
