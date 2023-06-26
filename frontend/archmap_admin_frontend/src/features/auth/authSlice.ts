import { createSlice } from '@reduxjs/toolkit'

import type { PayloadAction } from '@reduxjs/toolkit'



export interface authState {
    name: string;
    role: string;
    permission: string;
    id: string;
    jwttoken: string;
    email:string
}

const getFromLocalStorage = (key: string) => {

    const value = localStorage.getItem(key)
    if (value) {
        // check if the jwt token is expired
        if(JSON.parse(value).jwttoken){
            const jwt = JSON.parse(value).jwttoken
            const jwtData = jwt.split('.')[1]
            const decodedJwtJsonData = window.atob(jwtData)
            const decodedJwtData = JSON.parse(decodedJwtJsonData)
            const expirationDateInMs = decodedJwtData.exp * 1000
            const todayDateInMs = new Date().getTime()
            if (expirationDateInMs < todayDateInMs) {
                console.log("Token expired")
                localStorage.removeItem('auth')
                return {
                    name: "",
                    role: "",
                    permission: "",
                    id: "",
                    jwttoken: "",
                    email:""
                  }
            }   

        return JSON.parse(value)
    }
}
    const initialState: authState = {
        name: "",
        role: "",
        permission: "",
        id: "",
        jwttoken: "",
        email:""
      }
    return initialState
}

const initialState: authState = getFromLocalStorage('auth');

    
  export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action: PayloadAction<authState>) => {
            state.name = action.payload.name;
            state.role = action.payload.role;
            state.permission = action.payload.permission;
            state.jwttoken = action.payload.jwttoken;
            state.id = action.payload.id;
            state.email = action.payload.email;

            localStorage.setItem('auth', JSON.stringify(state))
        },
        logout: (state) => {
            state.name = "";
            state.role = "";
            state.permission = "";
            state.jwttoken = "";
            localStorage.removeItem('auth')
            
        }
    },
    })

    

    export const { login, logout } = authSlice.actions
    export default authSlice.reducer