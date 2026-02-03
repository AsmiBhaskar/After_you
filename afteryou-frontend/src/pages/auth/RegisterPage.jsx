import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  MenuItem,
} from "@mui/material";
import { Email, Lock, Person } from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, registerLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return;

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      password2: formData.confirmPassword,
      role: formData.role,
    });

    if (result?.success) navigate("/login");
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

      {/* RIGHT PANEL — EXACT SAME AS LOGIN */}
      <Box
        sx={{
          width: { xs: "100%", lg: "50%" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fdfbf7",
          px: 8,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Create account
          </Typography>
          <Typography sx={{ color: "#78716c", mb: 4 }}>
            Join After You and get started.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {/* USERNAME */}
            <Typography fontSize={14} fontWeight={700} sx={{ mb: 0.5 }}>
              Username
            </Typography>
            <TextField
              fullWidth
              size="small"
              name="username"
              value={formData.username}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: "#78716c" }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {/* EMAIL */}
            <Typography fontSize={14} fontWeight={700} sx={{ mb: 0.5 }}>
              Email address
            </Typography>
            <TextField
              fullWidth
              size="small"
              name="email"
              value={formData.email}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: "#78716c" }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {/* PASSWORD */}
            <Typography fontSize={14} fontWeight={700} sx={{ mb: 0.5 }}>
              Password
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "#78716c" }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {/* CONFIRM PASSWORD */}
            <Typography fontSize={14} fontWeight={700} sx={{ mb: 0.5 }}>
              Confirm password
            </Typography>
            <TextField
              fullWidth
              type="password"
              size="small"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "#78716c" }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {/* ROLE */}
            <Typography fontSize={14} fontWeight={700} sx={{ mb: 0.5 }}>
              Role
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              name="role"
              value={formData.role}
              onChange={handleChange}
              sx={{ mb: 3 }}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="executor">Executor</MenuItem>
            </TextField>

            <Button
              type="submit"
              fullWidth
              disabled={registerLoading}
              sx={{
                py: 1.6,
                fontSize: "1rem",
                fontWeight: 700,
                color: "#fff",
                backgroundColor: "#d97706",
                "&:hover": { backgroundColor: "#b45309" },
              }}
            >
              {registerLoading ? "Creating Account..." : "Create Account"}
            </Button>

            <Typography align="center" sx={{ mt: 3, color: "#78716c" }}>
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  fontWeight: 700,
                  color: "#d97706",
                  textDecoration: "none",
                }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterPage;
