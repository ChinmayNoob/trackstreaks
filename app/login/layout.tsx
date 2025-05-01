const AuthLayout = (
    {children}:
    {children:React.ReactNode}) =>{

        return(
            <div className="h-screen bg-black">
                <div className="h-full flex items-center justify-center">
                    {children}
                </div>
            </div>
        )

}

export default AuthLayout;