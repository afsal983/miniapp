export function setBranchInfo(data) {
    return {
        type: 'BRANCH_INFO',
        payload: data,
    };
}
export function setBranchId(data) {
    return {
        type: 'BRANCH_ID',
        payload: data,
    };
}

export function setSelectedCustomer(data) {
    
    return {
        type: 'SELECTED_CUSTOMER',
        payload: data,
    };
}


export function setEmployeeInfo(data) {
    return {
        type: 'EMPLOYEE_INFO',
        payload: data,
    };
}

export function employeeLogout() {
    return {
        type: 'EMPLOYEE_LOGOUT',
    };
}

export function globalLogout() {
    return {
        type: 'GLOBAL_LOGOUT',
    };
}

export function setEmployeeToken(data) {
    return {
        type: 'EMPLOYEE_TOKEN',
        payload: data,
    };
}

export function setEmployeeRefreshToken(data) {
    return {
        type: 'EMPLOYEE_REFRESH_TOKEN',
        payload: data,
    };
}

export function setBranchToken(data) {
    return {
        type: 'BRANCH_TOKEN',
        payload: data,
    };
}

export function setBranchRefreshToken(data) {
    return {
        type: 'BRANCH_REFRESH_TOKEN',
        payload: data,
    };
}

export function logout() {
    return {
        type: 'LOGOUT_FLAG',
    };
}

export function resetState() {
    return {
        type: 'RESET_STATE',
    };
}

export function setSelectedProducts(data) {
    return {
        type: 'SELECTED_CART_PRODUCT',
        payload: data,
    };
}

export function setSelectedBranch(data) {
    return {
        type: 'SELECTED_BRANCH',
        payload: data,
    };
}

export function setDefaultEmployee(data) {
    return {
        type: 'SET_DEFAULT_EMPLOYEE',
        payload: data,
    };
}

export function setSettings(data) {
    return {
        type: 'SET_SETTINGS',
        payload: data,
    };
}




