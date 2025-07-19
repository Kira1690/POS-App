import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type AuthStackParamList = {
  Welcome: undefined;
  StaffLogin: undefined;
  ManagerLogin: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Orders: undefined;
  Tables: undefined;
  Menu: undefined;
  Settings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}