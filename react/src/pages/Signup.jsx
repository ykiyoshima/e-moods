import axios from "axios";

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
        window.location.href = '/spotify';
      } else {
        document.getElementById('message').innerHTML = response.data.message;
      }
    }
  };

  return (
    <div id="main" className="sm:w-full md:w-1/3 mx-auto">
      <h1 className="text-3xl font-bold pt-24 pb-16">{title}</h1>
      <label htmlFor="username">ユーザー名</label><br/>
      <input type="text" required id="username" className="text-gray-900 rounded-md px-2 mb-4" /><br />

      <label htmlFor="email">メールアドレス</label><br/>
      <input type="email" required id="email" className="text-gray-900 rounded-md px-2 mb-4" /><br />

      <label htmlFor="password">パスワード</label><br/>
      <input type="password" required id="password" className="text-gray-900 rounded-md px-2 mb-4" /><br />

      <label htmlFor="repassword">パスワード再入力</label><br/>
      <input type="password" required id="repassword" className="text-gray-900 rounded-md px-2 mb-4" /><br />

      <p id="message"></p>
      <button className="bg-green-500 rounded-lg w-48 py-2 px-4 mt-4" onClick={() => execSignup()}>次へ進む</button>
    </div>
  );
};