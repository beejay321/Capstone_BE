import sgMail from "@sendgrid/mail";
import { mailTemplate } from "./template.js";

const { SENDGRID_API_KEY, SENGRID_EMAIL } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

const sendMailAfterPayment = async ({ to, title, description, price, link }) => {
  try {
    const msg = {
      to,
      from: {
        name: "MY APP",
        email: SENGRID_EMAIL,
      },
      subject: "Your Payment has been made",
      //   text: "and easy to do anywhere, even with Node.js",
      html: `<html>
  <head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment</title>
  <style>
    .center {
      margin: auto;
      display: flex;
      justify-content: center;
    }
    .myHeading {
      color: red;
    }
    .labels {
      margin: 5px;
    }
    .fixedValue {
      margin: 5px;
      background-color: #f2f2f2;
      padding: 5px;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <header class = "center" >
    <h2>Payment has been Made</h2>
  </header>
  <main>
    <hr />
   <div class = "center" >
      <div>
        <div >
          <p class="labels">Product Title</p>
          <p class="fixedValue">${title}</p>
        </div>
        <div>
          <p class="labels">Description</p>
          <p class="fixedValue">${description}</p>
        </div>
        <div>
          <p class="labels">Price</p>
          <p class="fixedValue">${price}</p>
        </div>
        <p class="labels" >Please confirm the details of this Project by Clicking <a href=${link}>Here</a></p>
    </div>
   </div>
  <footer class = "center"  >
    <p>And this text is just for the exercise too!</p>
  </footer>
</body>
      </html>`,
    };
    const sengridResponse = await sgMail.send(msg);
    console.log(sengridResponse);
  } catch (error) {
    console.log(error);
  }
};

export default sendMailAfterPayment;
