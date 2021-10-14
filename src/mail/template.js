export const mailTemplate = ({ title, email }) => `
<!DOCTYPE html>

<html>
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
            <p class="fixedValue">title</p>
          </div>
          <div>
            <p class="labels">Email address</p>
            <p class="fixedValue">email</p>
          </div>
          <p class="labels" >Please confirm the details of this Project by Clicking <a href="http://localhost:3000/confirmProjectDetails">Here</a></p>

        </div>
     </div>    
  </body>
        </html>`;
