import { useChangePassword } from '@/hooks/useChangePassword';
import crossIcon from '../../public/SVGs/crossIcon.svg'


import { useAuth } from '@/contexts/AuthContext';


function LoginReminder() {

  const { onOpen: openChangePasswordModal } = useChangePassword();

  const { setIsLoginAlertOpen } = useAuth();
  const { agent } = useAuth();

  const handleChangePassword = () => {
    openChangePasswordModal();
  };
  const date = new Date();
  date.setDate(date.getDate() + agent.PWExpireTime);

  return (
    <div className='fixed top-0 bottom-0 right-0 left-0 bg-black/50 flex justify-center z-50 items-center'>
      <div className="max-w-[420px] h-auto bg-white absolute rounded-lg px-4 py-6 mx-2 md:px-6 flex flex-col shadow-lg">
        <div onClick={() => setIsLoginAlertOpen(false)} className="absolute -top-2 md:-top-4 -right-2 md:-right-4 border bg-white rounded-full w-7 h-7 md:w-10 md:h-10 flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-200 ease-in-out">
          <img className='w-5 h-5' src={crossIcon} alt="" />
        </div>
        <div className="flex flex-col gap-1 md:gap-6 md:flex-row justify-center items-center mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">Change Your Password</h2>
          <span className="md:ml-auto px-3 py-1 bg-red-100 text-red-600 text-sm rounded-full font-medium">
            Expires in {agent.PWExpireTime} days
          </span>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 mb-4">
          <p className="text-[14px] text-[#002734] text-center py-4 flex flex-col">
            Your password will expire on
            <span>{date.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}</span>
          </p>
        </div>
        <div className="">
          <button
            className="w-full px-6 py-2.5 bg-[#f97316] text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-medium shadow-sm"
            onClick={handleChangePassword}
          >
            Change Password Now
          </button>

        </div>
      </div>
    </div>
  )
}

export default LoginReminder
