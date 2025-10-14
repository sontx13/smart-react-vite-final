import {
  Action,
  configureStore,
  ThunkAction,
} from '@reduxjs/toolkit';
import accountReducer from './slice/accountSlide';
import companyReducer from './slice/companySlide';
import appReducer from './slice/appSlide';
import zmauReducer from './slice/zmauSlide';
import qaReducer from './slice/QASlide';
import newReducer from './slice/newSlide';
import inforReducer from './slice/inforSlide';
import hotlineReducer from './slice/hotlineSlide';
import configReducer from './slice/configSlide';
import categoryReducer from './slice/categorySlide';
import bannerReducer from './slice/bannerSlide';
import examReducer from './slice/examSlide';
import questionReducer from './slice/questionSlide';
import answerReducer from './slice/answerSlide';
import submissionReducer from './slice/submissionSlide';
import userReducer from './slice/userSlide';
import jobReducer from './slice/jobSlide';
import resumeReducer from './slice/resumeSlide';
import permissionReducer from './slice/permissionSlide';
import roleReducer from './slice/roleSlide';
import skillReducer from './slice/skillSlide';

export const store = configureStore({
  reducer: {
    account: accountReducer,
    company: companyReducer,
    app: appReducer,
    zmau: zmauReducer,
    qa: qaReducer,
    new: newReducer,
    infor: inforReducer,
    hotline: hotlineReducer,
    config: configReducer,
    category: categoryReducer,
    banner: bannerReducer,
    exam: examReducer,
    question: questionReducer,
    answer: answerReducer,
    submission: submissionReducer,
    user: userReducer,
    job: jobReducer,
    resume: resumeReducer,
    permission: permissionReducer,
    role: roleReducer,
    skill: skillReducer,
  },
});


export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;