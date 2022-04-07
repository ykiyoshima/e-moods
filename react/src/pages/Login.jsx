import axios from "axios";

export const Login = () => {
  const execLogin = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email && password) {
      const data = {
        email: email,
        password: password
      };
      const response = await axios.post('/login_confirm', data, {withCredentials: true});
      if (response.data.status === 'OK') {
        window.location.href = '/';
      } else if (response.data.status === 'NG') {
        window.location.href = '/spotify';
      } else {
        document.getElementById('message').innerHTML = response.data.message;
      }
    } else {
      document.getElementById('message').innerHTML = '未入力の項目があります';
    }

  };
  window.onload = () => {
    document.getElementById('signup_btn').addEventListener('click', () => {
      window.location.href = '/signup';
    });
    document.getElementById('password').onkeydown = (e) => {
      if (e.key === 'Enter') {
        document.getElementById('login_btn').click();
      }
    }
  }


  return (
    <div id="main" className="sm:w-full md:w-1/3 mx-auto">
      <h1 className="text-5xl font-bold pt-24 pb-16">e-moods</h1>
      <p>あなたの<strong>"表情"</strong>で楽曲を自動分類</p>
      <p className="mb-8">今の気分に合う音楽を簡単に探せます！</p>
      <form>
        <label htmlFor="email">メールアドレス</label><br/>
        <input type="email" id="email" className="text-gray-900 rounded-md px-2 mb-4" name="email" required /><br/>
        <label htmlFor="password">パスワード</label><br/>
        <input type="password" id="password" className="text-gray-900 rounded-md px-2" name="password" required /><br/>
        <div id="message" className="mt-4 mb-8"></div>
        <button id="login_btn" className="bg-green-500 rounded-lg w-48 py-2 px-4 mb-8" onClick={() => execLogin()}>ログイン</button>
      </form>

      <p>アカウントをお持ちでない方</p>
      <button id="signup_btn" className="bg-green-500 rounded-lg inline-block w-48 h-10 align-middle py-2 mt-4">新規登録</button>
    </div>
  );
};