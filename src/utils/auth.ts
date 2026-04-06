let loggedIn = false;

export const isSessionLoggedIn = () => loggedIn;

export const setSessionLoggedIn = (value: boolean) => {
  loggedIn = value;
};

export const resetSessionLogin = () => {
  loggedIn = false;
};
