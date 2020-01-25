import { postRequest, getRequest } from "../http";

export function verifyLogged(access_token) {
  return new Promise((resolve, reject) => {
    postRequest(`/verify_token`, {
      access_token: access_token
    })
      .then(res => {
        resolve(true);
      })
      .catch(err => {
        resolve(false);
      });
  });
}

export function login(email, password) {

  return new Promise((resolve, reject) => {
    postRequest(`/login`, {
      email: email,
      password: password
    })
      .then(res => {
        const json = res.data;
        if (json.access_token) resolve(json.access_token, json.profile, json.role);
        else reject(new Error("Authentication failed."));
      })
      .catch(reject);
  });
}

export function askForPermission(full_name, email, reason, message) {
  return new Promise((resolve, reject) => {
    postRequest(`/login`, {
      full_name: full_name,
      email: email,
      reason: reason,
      message: message
    })
      .then(res => {
        const json = res.data;
        resolve(json);
      })
      .catch(reject);
  });
}

export function refreshToken(current_token) {
  return new Promise((resolve, reject) => {
    postRequest(`/refresh-token`, {
      current_token: current_token
    })
      .then(res => {
        const json = res.data;
        if (json.new_token) resolve(json.new_token);
        else reject(new Error("Unable to refresh your token."));
      })
      .catch(reject);
  });
}
