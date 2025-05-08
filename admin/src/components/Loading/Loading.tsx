import { SIZE } from "@utils/constants";

interface iLoadingProps {
    size?: typeof SIZE[keyof typeof SIZE];
}

const Loading = ({ size = SIZE.SM }: iLoadingProps) => {

    return (
        <div className='loading-container'>
            <span className={`loader ${size}`} />
        </div>
    );
};

export default Loading;