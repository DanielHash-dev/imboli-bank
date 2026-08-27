import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/store/gameStore";

const Index = () => {
  const navigate = useNavigate();
  const isGameActive = useGameStore((s) => s.isGameActive);

  useEffect(() => {
    if (isGameActive) {
      navigate("/home", { replace: true });
    } else {
      navigate("/setup", { replace: true });
    }
  }, [isGameActive, navigate]);

  return null;
};

export default Index;
