import { Spin } from "antd";
import { useMoralis, useNativeBalance } from "react-moralis";

function NativeBalance(props) {
  const { data: balance, isLoading } = useNativeBalance(props);
  const { account, isAuthenticated } = useMoralis();
  if (!account || !isAuthenticated) return null;
  if (isLoading) return <Spin></Spin>;
  return (
    <div style={{ textAlign: "center", whiteSpace: "nowrap" }}>
      {balance.formatted}
    </div>
  );
}

export default NativeBalance;
