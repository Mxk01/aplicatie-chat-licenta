import { createContext, useState } from "react";
import { useFormik } from 'formik';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();
    
    const formik = useFormik({
        initialValues: {
            profileAvatar: '',
            email: '',
            username: '',
            password: ''
        },
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const formData = new FormData();
                for (const value in values) {
                    formData.append(value, values[value]);
                }
                 console.log(formData)
         
                    const registeredUser = await axios.post('/api/user/create-user', formData);
                    console.log(registeredUser);
                    navigate('/');
                

                setSubmitting(false);
            } catch (error) {
                console.log(error.message);
            }
        }
    });

    const changeImage = (e) => {
        formik.setFieldValue('profileAvatar', e.currentTarget.files[0]);
    };

    const values = {
        changeImage,
        formik,
        confirmPassword,
        setConfirmPassword
    };

    return (
        <AuthContext.Provider value={values}>
            {children}
        </AuthContext.Provider>
    );
};
