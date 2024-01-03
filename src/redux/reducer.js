const rootReducer = (state = {
    selectedProductList: []
}, action) => {
    console.log(action);
    switch (action.type) {
        case 'BRANCH_INFO':
            return { ...state, branchInfo: action.payload }
        case 'EMPLOYEE_INFO':
            return { ...state, userData: action.payload }
        case 'BRANCH_TOKEN':
            return { ...state, branchToken: action.payload }
        case 'BRANCH_REFRESH_TOKEN':
            return { ...state, branchRefreshToken: action.payload }
        case 'EMPLOYEE_TOKEN':
            return { ...state, employeeToken: action.payload }
        case 'EMPLOYEE_REFRESH_TOKEN':
            return { ...state, employeeRefreshToken: action.payload }
        case 'BRANCH_ID':
            return { ...state, branchId: action.payload }
        case 'SELECTED_CUSTOMER':
            return { ...state, selectedCustomer: action.payload }
        case 'SELECTED_CART_PRODUCT':
            return { ...state, selectedProductList: action.payload }
        case 'SELECTED_BRANCH':
            return { ...state, selectedBranch: action.payload }
        case 'SET_DEFAULT_EMPLOYEE':
            return { ...state, defaultEmployee: action.payload }
        case 'RESET_STATE':
            return {}
        case 'EMPLOYEE_LOGOUT':
            return {
                branchInfo: state.branchInfo,
                branchToken: state.branchToken,
                branchRefreshToken: state.branchRefreshToken,
                branchId: state.branchId,
            }
        case 'LOGOUT_FLAG':
            return {...state, logoutFlag: (state.logoutFlag || 0) +  1}
        case 'GLOBAL_LOGOUT_FLAG':
            return {...state, globalLogoutFlag: (state.globalLogoutFlag || 0) +  1}
        case 'SET_SETTINGS':
            return {...state, globalSettings: action.payload}   
        default:
            return state
    }
}
export default rootReducer
