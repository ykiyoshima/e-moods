import { Signup } from "./Signup";
import { Spotify } from "./Spotify";
import { Setting } from "./Setting";
import { Finish } from "./Finish";

export const Processes = ({ process }) => {
  switch (process) {
    case '新規登録':
      return (
        <>
          <Signup title={process} />
        </>
      );
    case 'Spotify連携':
      return (
        <>
          <Spotify title={process} />
        </>
      );
    case '好きなアーティスト設定':
      return (
        <>
          <Setting title={process} />
        </>
      );
    case '登録完了':
      return (
        <>
          <Finish title={process} />
        </>
      );
    default:
      console.log('Error has been occurred');
      break;
  }
};