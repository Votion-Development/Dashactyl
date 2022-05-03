export enum Permissions {
    ACCOUNT_UPDATE,
    ACCOUND_UPDATE_ADMIN,
    ACCOUNT_REFERRAL,
    ACCOUNT_DELETE,

    SERVER_CREATE,
    SERVER_UPDATE,
    SERVER_UPDATE_ADMIN,
    SERVER_DELETE,
    SERVER_DELETE_ADMIN,

    COUPON_CREATE,
    COUPON_REDEEM,
    COUPON_DELETE,

    PACKAGE_VIEW,
    PACKAGE_PURCHASE,
    PACKAGE_CREATE,
    PACKAGE_UPDATE,
    PACKAGE_DELETE,

    EGG_VIEW,
    EGG_CREATE,
    EGG_UPDATE,
    EGG_DELETE
}

function getUser(): number[] {
    return [
        Permissions.ACCOUNT_UPDATE,
        Permissions.ACCOUNT_REFERRAL,
        Permissions.SERVER_CREATE,
        Permissions.SERVER_UPDATE,
        Permissions.SERVER_DELETE,
        Permissions.COUPON_REDEEM,
        Permissions.PACKAGE_VIEW,
        Permissions.PACKAGE_PURCHASE
    ]
}

function getAdminUser(): number[] {
    return [
        Permissions.ACCOUND_UPDATE_ADMIN
    ]
}

function getAdminServer(): number[] {
    return [
        Permissions.SERVER_UPDATE_ADMIN,
        Permissions.SERVER_DELETE_ADMIN
    ]
}

function getAdminCoupon(): number[] {
    return [
        Permissions.COUPON_CREATE,
        Permissions.COUPON_DELETE
    ]
}

function getAdminPackage(): number[] {
    return [
        Permissions.PACKAGE_CREATE,
        Permissions.PACKAGE_UPDATE,
        Permissions.PACKAGE_DELETE
    ]
}

function getAdminEgg(): number[] {
    return [
        Permissions.EGG_VIEW,
        Permissions.EGG_CREATE,
        Permissions.EGG_UPDATE,
        Permissions.EGG_DELETE
    ]
}

export default {
    getUser,
    getAdminUser,
    getAdminServer,
    getAdminCoupon,
    getAdminPackage,
    getAdminEgg
}
