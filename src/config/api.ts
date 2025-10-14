import { IBackendRes, ICompany, IAccount, IUser, IModelPaginate, IGetAccount, IJob, IResume, IPermission, IRole, ISkill, ISubscribers, IExam, IQuestion, IAnswer, ISubmission, IApp, IZmau, IQA, INew, IInfor, IHotline, IConfig, ICategory, IBanner } from '@/types/backend';
import axios from 'config/axios-customize';

/**
 * 
Module Auth
 */
export const callRegister = (name: string, email: string, password: string, age: number, gender: string, address: string) => {
    return axios.post<IBackendRes<IUser>>('/api/v1/auth/register', { name, email, password, age, gender, address })
}

export const callLogin = (username: string, password: string) => {
    return axios.post<IBackendRes<IAccount>>('/api/v1/auth/login', { username, password })
}

export const callFetchAccount = () => {
    return axios.get<IBackendRes<IGetAccount>>('/api/v1/auth/account')
}

export const callRefreshToken = () => {
    return axios.get<IBackendRes<IAccount>>('/api/v1/auth/refresh')
}

export const callLogout = () => {
    return axios.post<IBackendRes<string>>('/api/v1/auth/logout')
}

/**
 * Upload single file
 */
export const callUploadSingleFile = (file: any, folderType: string) => {
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);
    bodyFormData.append('folder', folderType);

    return axios<IBackendRes<{ fileName: string }>>({
        method: 'post',
        url: '/api/v1/files',
        data: bodyFormData,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}




/**
 * 
Module Company
 */
export const callCreateCompany = (name: string, address: string, description: string, logo: string) => {
    return axios.post<IBackendRes<ICompany>>('/api/v1/companies', { name, address, description, logo })
}

export const callUpdateCompany = (id: string, name: string, address: string, description: string, logo: string) => {
    return axios.put<IBackendRes<ICompany>>(`/api/v1/companies`, { id, name, address, description, logo })
}

export const callDeleteCompany = (id: string) => {
    return axios.delete<IBackendRes<ICompany>>(`/api/v1/companies/${id}`);
}

export const callFetchCompany = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ICompany>>>(`/api/v1/companies?${query}`);
}

export const callFetchCompanyById = (id: string) => {
    return axios.get<IBackendRes<ICompany>>(`/api/v1/companies/${id}`);
}



/**
 * 
Module App
 */
export const callCreateApp = (name: string, type: number,sort: number,active: boolean, description: string, logo: string) => {
    return axios.post<IBackendRes<IApp>>('/api/v1/apps', { name, type, sort, active,description, logo })
}

export const callUpdateApp = (id: string, name: string, type: number,sort: number,active: boolean, description: string, logo: string) => {
    return axios.put<IBackendRes<IApp>>(`/api/v1/apps`, { id, name, type, sort, active, description, logo })
}

export const callDeleteApp = (id: string) => {
    return axios.delete<IBackendRes<IApp>>(`/api/v1/apps/${id}`);
}

export const callFetchApp = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IApp>>>(`/api/v1/apps?${query}`);
}

export const callFetchAppById = (id: string) => {
    return axios.get<IBackendRes<IApp>>(`/api/v1/apps/${id}`);
}

/**
 * 
Module Skill
 */
export const callCreateSkill = (name: string) => {
    return axios.post<IBackendRes<ISkill>>('/api/v1/skills', { name })
}

export const callUpdateSkill = (id: string, name: string) => {
    return axios.put<IBackendRes<ISkill>>(`/api/v1/skills`, { id, name })
}

export const callDeleteSkill = (id: string) => {
    return axios.delete<IBackendRes<ISkill>>(`/api/v1/skills/${id}`);
}

export const callFetchAllSkill = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ISkill>>>(`/api/v1/skills?${query}`);
}



/**
 * 
Module User
 */
export const callCreateUser = (user: IUser) => {
    return axios.post<IBackendRes<IUser>>('/api/v1/users', { ...user })
}

export const callUpdateUser = (user: IUser) => {
    return axios.put<IBackendRes<IUser>>(`/api/v1/users`, { ...user })
}

export const callDeleteUser = (id: string) => {
    return axios.delete<IBackendRes<IUser>>(`/api/v1/users/${id}`);
}

export const callFetchUserById = (id: string) => {
    return axios.get<IBackendRes<IUser>>(`/api/v1/users/${id}`);
}

export const callFetchUser = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IUser>>>(`/api/v1/users?${query}`);
}

/**
 * 
Module Job
 */
export const callCreateJob = (job: IJob) => {
    return axios.post<IBackendRes<IJob>>('/api/v1/jobs', { ...job })
}

export const callUpdateJob = (job: IJob, id: string) => {
    return axios.put<IBackendRes<IJob>>(`/api/v1/jobs`, { id, ...job })
}

export const callDeleteJob = (id: string) => {
    return axios.delete<IBackendRes<IJob>>(`/api/v1/jobs/${id}`);
}

export const callFetchJob = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IJob>>>(`/api/v1/jobs?${query}`);
}

export const callFetchJobById = (id: string) => {
    return axios.get<IBackendRes<IJob>>(`/api/v1/jobs/${id}`);
}

/**
 * 
Module Resume
 */
export const callCreateResume = (url: string, jobId: any, email: string, userId: string | number) => {
    return axios.post<IBackendRes<IResume>>('/api/v1/resumes', {
        email, url,
        status: "PENDING",
        user: {
            "id": userId
        },
        job: {
            "id": jobId
        }
    })
}

export const callUpdateResumeStatus = (id: any, status: string) => {
    return axios.put<IBackendRes<IResume>>(`/api/v1/resumes`, { id, status })
}

export const callDeleteResume = (id: string) => {
    return axios.delete<IBackendRes<IResume>>(`/api/v1/resumes/${id}`);
}

export const callFetchResume = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IResume>>>(`/api/v1/resumes?${query}`);
}

export const callFetchResumeById = (id: string) => {
    return axios.get<IBackendRes<IResume>>(`/api/v1/resumes/${id}`);
}

export const callFetchResumeByUser = () => {
    return axios.post<IBackendRes<IModelPaginate<IResume>>>(`/api/v1/resumes/by-user`);
}

/**
 * 
Module Permission
 */
export const callCreatePermission = (permission: IPermission) => {
    return axios.post<IBackendRes<IPermission>>('/api/v1/permissions', { ...permission })
}

export const callUpdatePermission = (permission: IPermission, id: string) => {
    return axios.put<IBackendRes<IPermission>>(`/api/v1/permissions`, { id, ...permission })
}

export const callDeletePermission = (id: string) => {
    return axios.delete<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`);
}

export const callFetchPermission = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IPermission>>>(`/api/v1/permissions?${query}`);
}

export const callFetchPermissionById = (id: string) => {
    return axios.get<IBackendRes<IPermission>>(`/api/v1/permissions/${id}`);
}

/**
 * 
Module Role
 */
export const callCreateRole = (role: IRole) => {
    return axios.post<IBackendRes<IRole>>('/api/v1/roles', { ...role })
}

export const callUpdateRole = (role: IRole, id: string) => {
    return axios.put<IBackendRes<IRole>>(`/api/v1/roles`, { id, ...role })
}

export const callDeleteRole = (id: string) => {
    return axios.delete<IBackendRes<IRole>>(`/api/v1/roles/${id}`);
}

export const callFetchRole = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IRole>>>(`/api/v1/roles?${query}`);
}

export const callFetchRoleById = (id: string) => {
    return axios.get<IBackendRes<IRole>>(`/api/v1/roles/${id}`);
}

/**
 * 
Module Subscribers
 */
export const callCreateSubscriber = (subs: ISubscribers) => {
    return axios.post<IBackendRes<ISubscribers>>('/api/v1/subscribers', { ...subs })
}

export const callGetSubscriberSkills = () => {
    return axios.post<IBackendRes<ISubscribers>>('/api/v1/subscribers/skills')
}

export const callUpdateSubscriber = (subs: ISubscribers) => {
    return axios.put<IBackendRes<ISubscribers>>(`/api/v1/subscribers`, { ...subs })
}

export const callDeleteSubscriber = (id: string) => {
    return axios.delete<IBackendRes<ISubscribers>>(`/api/v1/subscribers/${id}`);
}

export const callFetchSubscriber = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ISubscribers>>>(`/api/v1/subscribers?${query}`);
}

export const callFetchSubscriberById = (id: string) => {
    return axios.get<IBackendRes<ISubscribers>>(`/api/v1/subscribers/${id}`);
}

/**
 * 
Module Exam
 */
export const callCreateExam = (exam: IExam) => {
    return axios.post<IBackendRes<IExam>>('/api/v1/exams', { ...exam })
}

export const callUpdateExam = (exam: IExam, id: string) => {
    return axios.put<IBackendRes<IExam>>(`/api/v1/exams`, { id, ...exam })
}

export const callDeleteExam = (id: string) => {
    return axios.delete<IBackendRes<IExam>>(`/api/v1/exams/${id}`);
}

export const callFetchExam = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IExam>>>(`/api/v1/exams?${query}`);
}

export const callFetchExamById = (id: string) => {
    return axios.get<IBackendRes<IExam>>(`/api/v1/exams/${id}`);
}

/**
 * 
Module Zmau
 */
export const callCreateZmau = (zmau: IZmau) => {
    return axios.post<IBackendRes<IZmau>>('/api/v1/zmaus', { ...zmau })
}

export const callUpdateZmau = (zmau: IZmau, id: string) => {
    return axios.put<IBackendRes<IZmau>>(`/api/v1/zmaus`, { id, ...zmau })
}

export const callDeleteZmau = (id: string) => {
    return axios.delete<IBackendRes<IZmau>>(`/api/v1/zmaus/${id}`);
}

export const callFetchZmau = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IZmau>>>(`/api/v1/zmaus?${query}`);
}

export const callFetchZmauById = (id: string) => {
    return axios.get<IBackendRes<IZmau>>(`/api/v1/zmaus/${id}`);
}


/**
 * 
Module QA
 */
export const callCreateQA = (zmau: IQA) => {
    return axios.post<IBackendRes<IQA>>('/api/v1/qas', { ...zmau })
}

export const callUpdateQA = (zmau: IQA, id: string) => {
    return axios.put<IBackendRes<IQA>>(`/api/v1/qas`, { id, ...zmau })
}

export const callDeleteQA = (id: string) => {
    return axios.delete<IBackendRes<IQA>>(`/api/v1/qas/${id}`);
}

export const callFetchQA = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IQA>>>(`/api/v1/qas?${query}`);
}

export const callFetchQAById = (id: string) => {
    return axios.get<IBackendRes<IQA>>(`/api/v1/qas/${id}`);
}


/**
 * 
Module New
 */
export const callCreateNew = (appnew: INew) => {
    return axios.post<IBackendRes<INew>>('/api/v1/news', { ...appnew })
}

export const callUpdateNew = (appnew: INew, id: string) => {
    return axios.put<IBackendRes<INew>>(`/api/v1/news`, { id, ...appnew })
}

export const callDeleteNew = (id: string) => {
    return axios.delete<IBackendRes<INew>>(`/api/v1/news/${id}`);
}

export const callFetchNew = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<INew>>>(`/api/v1/news?${query}`);
}

export const callFetchNewById = (id: string) => {
    return axios.get<IBackendRes<INew>>(`/api/v1/news/${id}`);
}

/**
 * 
Module Infor
 */
export const callCreateInfor = (infor: IInfor) => {
    return axios.post<IBackendRes<IInfor>>('/api/v1/infors', { ...infor })
}

export const callUpdateInfor = (infor: IInfor, id: string) => {
    return axios.put<IBackendRes<IInfor>>(`/api/v1/infors`, { id, ...infor })
}

export const callDeleteInfor = (id: string) => {
    return axios.delete<IBackendRes<IInfor>>(`/api/v1/infors/${id}`);
}

export const callFetchInfor = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IInfor>>>(`/api/v1/infors?${query}`);
}

export const callFetchInforById = (id: string) => {
    return axios.get<IBackendRes<IInfor>>(`/api/v1/infors/${id}`);
}


/**
 * 
Module Hotline
 */
export const callCreateHotline = (hotline: IHotline) => {
    return axios.post<IBackendRes<IHotline>>('/api/v1/hotlines', { ...hotline })
}

export const callUpdateHotline = (hotline: IHotline, id: string) => {
    return axios.put<IBackendRes<IHotline>>(`/api/v1/hotlines`, { id, ...hotline })
}

export const callDeleteHotline = (id: string) => {
    return axios.delete<IBackendRes<IHotline>>(`/api/v1/hotlines/${id}`);
}

export const callFetchHotline = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IHotline>>>(`/api/v1/hotlines?${query}`);
}

export const callFetchHotlineById = (id: string) => {
    return axios.get<IBackendRes<IHotline>>(`/api/v1/hotlines/${id}`);
}

/**
 * 
Module Config
 */
export const callCreateConfig = (config: IConfig) => {
    return axios.post<IBackendRes<IConfig>>('/api/v1/configs', { ...config })
}

export const callUpdateConfig = (config: IConfig, id: string) => {
    return axios.put<IBackendRes<IConfig>>(`/api/v1/configs`, { id, ...config })
}

export const callDeleteConfig = (id: string) => {
    return axios.delete<IBackendRes<IConfig>>(`/api/v1/configs/${id}`);
}

export const callFetchConfig = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IConfig>>>(`/api/v1/configs?${query}`);
}

export const callFetchConfigById = (id: string) => {
    return axios.get<IBackendRes<IConfig>>(`/api/v1/configs/${id}`);
}

/**
 * 
Module Category
 */
export const callCreateCategory = (category: ICategory) => {
    return axios.post<IBackendRes<ICategory>>('/api/v1/categories', { ...category })
}

export const callUpdateCategory = (category: ICategory, id: string) => {
    return axios.put<IBackendRes<ICategory>>(`/api/v1/categories`, { id, ...category })
}

export const callDeleteCategory = (id: string) => {
    return axios.delete<IBackendRes<ICategory>>(`/api/v1/categories/${id}`);
}

export const callFetchCategory = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ICategory>>>(`/api/v1/categories?${query}`);
}

export const callFetchCategoryById = (id: string) => {
    return axios.get<IBackendRes<ICategory>>(`/api/v1/categories/${id}`);
}

/**
 * 
Module Banner
 */
export const callCreateBanner = (banner: IBanner) => {
    return axios.post<IBackendRes<IBanner>>('/api/v1/banners', { ...banner })
}

export const callUpdateBanner = (banner: IBanner, id: string) => {
    return axios.put<IBackendRes<IBanner>>(`/api/v1/banners`, { id, ...banner })
}

export const callDeleteBanner = (id: string) => {
    return axios.delete<IBackendRes<IBanner>>(`/api/v1/banners/${id}`);
}

export const callFetchBanner = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IBanner>>>(`/api/v1/banners?${query}`);
}

export const callFetchBannerById = (id: string) => {
    return axios.get<IBackendRes<IBanner>>(`/api/v1/banners/${id}`);
}

/**
 * 
Module Question
 */
export const callCreateQuestion = (question: IQuestion) => {
    return axios.post<IBackendRes<IQuestion>>('/api/v1/questions', { ...question })
}

export const callUpdateQuestion = (question: IQuestion, id: string) => {
    return axios.put<IBackendRes<IQuestion>>(`/api/v1/questions`, { id, ...question })
}

export const callDeleteQuestion = (id: string) => {
    return axios.delete<IBackendRes<IQuestion>>(`/api/v1/questions/${id}`);
}

export const callFetchQuestion = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IQuestion>>>(`/api/v1/questions?${query}`);
}

export const callFetchQuestionById = (id: string) => {
    return axios.get<IBackendRes<IQuestion>>(`/api/v1/questions/${id}`);
}

/**
 * 
Module Answer
 */
export const callCreateAnswer = (answer: IAnswer) => {
    return axios.post<IBackendRes<IAnswer>>('/api/v1/answers', { ...answer })
}

export const callUpdateAnswer = (answer: IAnswer, id: string) => {
    return axios.put<IBackendRes<IAnswer>>(`/api/v1/answers`, { id, ...answer })
}

export const callDeleteAnswer = (id: string) => {
    return axios.delete<IBackendRes<IAnswer>>(`/api/v1/answers/${id}`);
}

export const callFetchAnswer = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IAnswer>>>(`/api/v1/answers?${query}`);
}

export const callFetchAnswerById = (id: string) => {
    return axios.get<IBackendRes<IAnswer>>(`/api/v1/answers/${id}`);
}


/**
 * 
Module Submission
 */
export const callCreateSubmission = (submission: ISubmission) => {
    return axios.post<IBackendRes<ISubmission>>('/api/v1/submissions', { ...submission })
}

export const callUpdateSubmission = (submission: ISubmission, id: string) => {
    return axios.put<IBackendRes<ISubmission>>(`/api/v1/submissions`, { id, ...submission })
}

export const callDeleteSubmission = (id: string) => {
    return axios.delete<IBackendRes<ISubmission>>(`/api/v1/submissions/${id}`);
}

export const callFetchSubmission = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<ISubmission>>>(`/api/v1/submissions?${query}`);
}

export const callFetchSubmissionById = (id: string) => {
    return axios.get<IBackendRes<ISubmission>>(`/api/v1/submissions/${id}`);
}