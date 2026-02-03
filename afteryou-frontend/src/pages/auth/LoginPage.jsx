import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
} from "@mui/material";
import { Email, Lock, Person } from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData);
    if (result?.success) navigate("/dashboard");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* LEFT PANEL */}
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          width: "50%",
          position: "relative",
          color: "#fff",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.15), rgba(26,46,26,0.5)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuCn6x66_ChNeztGrkiAp78HQsoIPDVBIfkcsPl-SD1S_humqOmn8U8S1bgmfoayajivZiuN_uxAJmq4hn8l9WhfSNhQIDsCwrDf77nz-cHKUFbbyve0f7RDeZKtfaGaWyO4QScWC7xowehR2zsKkrRo_OOnVRbrjR7AJPN9X5Hgs4qQ4IVuiVW105caQD2FCiGoN2LnggKEKR46aFR14tm7Fwe6FV-V0RGWPJDY0TmyV9H2XGqCAGNf4WeJLNNmyhr0aOGS6uSa_A')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            p: 8,
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            After You
          </Typography>

          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography variant="h3" fontWeight={800} gutterBottom>
              Securing your legacy, one memory at a time.
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Access your secure vault and ensure your loved ones are cared for,
              no matter what the future holds.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* RIGHT PANEL – FULL FORM (NO BOX) */}
      <Box
        sx={{
          width: { xs: "100%", lg: "50%" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fdfbf7",
          px: 4,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Welcome back
          </Typography>
          <Typography sx={{ color: "#78716c", mb: 4 }}>
            Please enter your details to sign in.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {/* EMAIL */}
            <Typography
              fontSize={14}
              fontWeight={700}
              sx={{ mb: 1, color: "#4a453e" }}
            >
              Username
            </Typography>
            <TextField
              fullWidth
              name="username"
              placeholder="Enter Your Username"
              value={formData.username}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: "#78716c" }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            {/* PASSWORD */}
            <Typography
              fontSize={14}
              fontWeight={700}
              sx={{ mb: 1, color: "#4a453e" }}
            >
              Password
            </Typography>
            <TextField
              fullWidth
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "#78716c" }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 4 }}
            />

            <Button
              type="submit"
              fullWidth
              disabled={loginLoading}
              sx={{
                py: 1.6,
                fontSize: "1rem",
                fontWeight: 700,
                color: "#fff",
                backgroundColor: "#d97706",
                "&:hover": { backgroundColor: "#b45309" },
              }}
            >
              {loginLoading ? "Signing In..." : "Sign In"}
            </Button>

            <Typography align="center" sx={{ mt: 3, color: "#78716c" }}>
              Don’t have an account?{" "}
              <Link
                to="/register"
                style={{
                  fontWeight: 700,
                  color: "#d97706",
                  textDecoration: "none",
                }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
