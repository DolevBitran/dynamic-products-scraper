import { useSelector } from 'react-redux';
import {
    selectAnyError
} from '@store/selectors';

const Error = () => {
    // Show error message if any
    const errorMessage: string | null = useSelector(selectAnyError);

    // Display error message if any
    const showErrorMessage = errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{errorMessage}</span>
        </div>
    );

    if (!errorMessage) {
        return null
    }

    return (
        <div className="px-4 py-2">
            {showErrorMessage}
        </div>
    )
}

export default Error;