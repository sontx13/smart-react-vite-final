export interface ICompanySelect {
    label: string;
    value: string;
    key?: string;
}

export interface IAppSelect {
    label: string;
    value: string;
    key?: string;
}

export interface IBackendRes<T> {
    error?: string | string[];
    message: string;
    statusCode: number | string;
    data?: T;
}

export interface IModelPaginate<T> {
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: T[]
}

export interface IAccount {
    access_token: string;
    user: {
        id: string;
        email: string;
        name: string;
        phone: string;
        _admin: boolean;
        role: {
            id: string;
            name: string;
            permissions: {
                id: string;
                name: string;
                apiPath: string;
                method: string;
                module: string;
            }[]
        };
        company: {
            id?: string;
            name?: string;
        }
        app: {
            id?: string;
            name?: string;
        }
    }
}

export interface IGetAccount extends Omit<IAccount, "access_token"> { }

export interface ICompany {
    id?: string;
    name?: string;
    address?: string;
    logo: string;
    description?: string;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IAppSelect {
    label: string;
    value: string;
    key?: string;
}

export interface IApp {
    id?: string;
    name?: string;
    sort?: number;
    sort?: number;
    logo: string;
    description?: string;
    active: boolean;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IZmau {
    id?: string;
    name?: string;
    zid: number;
    avatar: string;
    phone_number: string;
    app?: {
        id: string;
        name: string;
        logo?: string;
    }
    active: boolean;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}


export interface IQA {
    id?: string;
    name_q?: string;
    email_q: string;
    phone_q: string;
    content_q: string;
    time_q: Date;
    name_a?: string;
    time_a: Date;
    content_a: string;
    app?: {
        id: string;
        name: string;
        logo?: string;
    }
    active: boolean;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface INew {
    id?: string;
    title?: string;
    content: string;
    logo: string;
    url: string;
    description: string;
    public_at: Date;
    app?: {
        id: string;
        name: string;
        logo?: string;
    }
    category?: {
        id: string;
        name: string;
        icon?: string;
    }
    active: boolean;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IArticle {
    id?: string;
    idArticle: string;
    title: string;
    titleCut: string;
    imageUrl: string;
    summary: string;
    createdDate: string;
    urlDetail: string;
    source: string;
    content: string;
    isNew: string;
    strucId: string;
    author: string;
    viewCount: number;
    cateName: string;
    cateId: number;
    otherProps: string;
    app?: {
        id: string;
    }
    category?: {
        id: string;
    }
    timeSync: string;
}

export interface IInfor {
    id?: string;
    name?: string;
    description: string;
    icon: string;
    url: string;
    type: number;
    sort: number;
    app?: {
        id: string;
        name: string;
        logo?: string;
    }
    active: boolean;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IHotline {
    id?: string;
    name?: string;
    phone_number: string;
    description: string;
    icon: string;
    type: number;
    sort: number;
    app?: {
        id: string;
        name: string;
        logo?: string;
    }
    active: boolean;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IConfig {
    id?: string;
    name?: string;
    description: string;
    icon: string;
    url: string;
    type: number;
    sort: number;
    app?: {
        id: string;
        name: string;
        logo?: string;
    }
    active: boolean;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface ICategory {
    id?: string;
    name?: string;
    icon: string;
    url: string;
    type: number;
    sort: number;
    app?: {
        id: string;
        name: string;
        logo?: string;
    }
    active: boolean;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IBanner {
    id?: string;
    name?: string;
    image: string;
    url: string;
    type: number;
    sort: number;
    app?: {
        id: string;
        name: string;
        logo?: string;
    }
    active: boolean;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface ISkill {
    id?: string;
    name?: string;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IExam {
    id?: string;
    name: string;
    level: number;
    time_minutes: number;
    total_score: number;
    total_question: number;
    logo: string;
    description: string;
    company?: {
        id: string;
        name: string;
        logo?: string;
    }
    active: boolean;
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IQuestion {
    id?: string;
    type: string;
    active: number;
    image: string;
    description?: string;
    exam?: {
        id: string;
        name: string;
        logo?: string;
    }
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}


export interface IAnswer {
    id?: string;
    correct_answer: boolean;
    description?: string;
    question?: {
        id: string;
        description: string;
        image?: string;
    }
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface ISubmission {
    id?: string;
    score: number;
    userId: string | {
        id: string;
        name: string;
        email: string;
    };
    companyId: string | {
        id: string;
        name: string;
        logo: string;
    };
    examId: string | {
        id: string;
        name: string;
        logo: string;
    };
    questionId: string | {
        id: string;
        description: string;
        image: string;
    };
    answerId: string | {
        id: string;
        description: string;
        score: number;
        correct_answer: boolean;
    };
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}


export interface IUser {
    id?: string;
    name: string;
    email: string;
    phone: string;
    _admin: boolean;
    password?: string;
    age: number;
    gender: string;
    address: string;
    role?: {
        id: string;
        name: string;
    }

    company?: {
        id: string;
        name: string;
    }
    app?: {
        id: string;
        name: string;
    }
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IJob {
    id?: string;
    name: string;
    skills: ISkill[];
    company?: {
        id: string;
        name: string;
        logo?: string;
    }
    location: string;
    salary: number;
    quantity: number;
    level: string;
    description: string;
    startDate: Date;
    endDate: Date;
    active: boolean;

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IResume {
    id?: string;
    email: string;
    userId: string;
    url: string;
    status: string;
    companyId: string | {
        id: string;
        name: string;
        logo: string;
    };
    jobId: string | {
        id: string;
        name: string;
    };
    history?: {
        status: string;
        updatedAt: Date;
        updatedBy: { id: string; email: string }
    }[]
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface IPermission {
    id?: string;
    name?: string;
    apiPath?: string;
    method?: string;
    module?: string;

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;

}

export interface IRole {
    id?: string;
    name: string;
    description: string;
    active: boolean;
    permissions: IPermission[] | string[];

    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface ISubscribers {
    id?: string;
    name?: string;
    email?: string;
    skills: string[];
    createdBy?: string;
    isDeleted?: boolean;
    deletedAt?: boolean | null;
    createdAt?: string;
    updatedAt?: string;
}