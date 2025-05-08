import { SIZE } from "@utils/constants";

interface iLoadingProps {
    size?: typeof SIZE[keyof typeof SIZE];
}

const Loading = ({ size = SIZE.SM }: iLoadingProps) => {

    return (
        <span className={`loader ${size}`}></span>
    );
};

export default Loading;