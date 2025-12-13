import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

export const DashboardPage = observer(() => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/pos");
  }, [navigate]);

  return null;
});
