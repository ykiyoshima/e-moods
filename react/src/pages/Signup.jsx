import axios from "axios";
import { createRipples } from "react-ripples";

const ButtonRipples = createRipples({
  color: 'snow',
  during: 600
});

export const Signup = ({ title }) => {
  const execSignup = async () => {
    const email = document.getElementById('email').value;
    if (!(email)) {
      document.getElementById('message').innerHTML = '未入力の項目があります';
      return;
    } else {
      const data = {
        email: email,
      };

      const response = await axios.post('/signup_confirm', data);
      if (response.data.status === 'OK') {
        window.location.href = '/send';
      } else {
        document.getElementById('message').innerHTML = response.data.message;
      }
    }
  };

  window.onload = () => {
    document.getElementById('email').onkeydown = (e) => {
      if (e.key === 'Enter') {
        document.getElementById('send_btn').click();
      }
    }
  }

  return (
    <div id="main" className="sm:w-full md:w-1/3 mx-auto">
      <h1 className="text-3xl font-bold pt-24 pb-16">{title}</h1>

      <label htmlFor="email">メールアドレス</label><br/>
      <input type="email" required id="email" className="text-gray-900 rounded-md px-2 mb-4" /><br />

      <p id="message"></p>
      <ButtonRipples>
        <button id="send_btn" className="bg-green-500 rounded-lg inline-block w-48 h-10 align-middle py-2" onClick={() => execSignup()}>メールを送信</button>
      </ButtonRipples>
    </div>
  );
};