import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FC, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { FaRegUserCircle } from 'react-icons/fa'

import Button from '@/ui/button/Button'
import Field from '@/ui/field/Field'
import { validEmail } from '@/ui/layout/header/login-form/login-auth.constants'
import { IAuthFields } from '@/ui/layout/header/login-form/login-form.interface'
import UserAvatar from '@/ui/user-avatar/UserAvatar'

import { useAuth } from '@/hooks/useAuth'
import { useOutside } from '@/hooks/useOutside'

import { AuthService } from '@/services/auth/auth.service'

import { menuAnimation } from '@/utils/animation/fade'

import styles from './LoginForm.module.scss'

const LoginForm: FC = () => {
	const { ref, setIsShow, isShow } = useOutside(false)

	const [type, setType] = useState<'login' | 'register'>('login')

	const {
		register,
		formState: { errors },
		handleSubmit,
		reset
	} = useForm<IAuthFields>({
		mode: 'onChange'
	})

	const { user, setUser } = useAuth()

	const { mutate: loginSync } = useMutation(
		['login'],
		(data: IAuthFields) => AuthService.login(data.email, data.password),
		{
			onSuccess(data) {
				if (setUser) {
					setUser(data.user)
					reset()
					setIsShow(false)
				}
			}
		}
	)

	const { mutate: registerSync } = useMutation(
		['register'],
		(data: IAuthFields) => AuthService.register(data.email, data.password),
		{
			onSuccess(data) {
				if (setUser) {
					setUser(data.user)
					reset()
					setIsShow(false)
				}
			}
		}
	)

	const onSubmit: SubmitHandler<IAuthFields> = data => {
		// if (type === 'login') loginSync(data)
		// else if (type === 'register') registerSync(data)
		switch (type) {
			case 'login':
				loginSync(data)
				break
			case 'register':
				registerSync(data)
				break
		}
	}

	return (
		<div className={styles.wrapper} ref={ref}>
			{user ? (
				<UserAvatar
					link='/dashboard'
					title='Перейти в dashboard'
					avatarPath={user.avatarPath || ''}
				/>
			) : (
				<button className={styles.button} onClick={() => setIsShow(!isShow)}>
					<FaRegUserCircle />
				</button>
			)}
			<motion.div
				initial={false}
				animate={isShow ? 'open' : 'closed'}
				variants={menuAnimation}
			>
				<form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
					<Field
						{...register('name')}
						placeholder='Name'
					/>
					<Field
						{...register('email', {
							required: 'Email is required',
							pattern: {
								value: validEmail,
								message: 'Please enter a valid email address'
							}
						})}
						placeholder='Email'
						error={errors.email}
					/>
					<Field
						{...register('password', {
							required: 'Password is required',
							minLength: {
								value: 6,
								message: 'Min length should be 6 symbols'
							}
						})}
						placeholder='Password'
						error={errors.password}
						type={'password'}
					/>
					<div className='mt-5 mb-1 text-center'>
						<Button onClick={() => setType('login')}>Login</Button>
					</div>
					<button
						className={styles.register}
						onClick={() => setType('register')}
					>
						Register
					</button>
				</form>
			</motion.div>
		</div>
	)
}

export default LoginForm
