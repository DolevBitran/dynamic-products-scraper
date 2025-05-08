import React from 'react';
import { Website } from '@store/models/auth';
import { WEBSITE_STATUS } from '@utils/constants';

interface WebsiteListProps {
  websites: Website[];
}

const WebsiteList: React.FC<WebsiteListProps> = ({ websites }) => {

  return (
    <div className="websites-list mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Your Websites</h3>
      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md shadow-sm">
        {websites.map((website: Website) => (
          <div
            key={website.id}
            className="website-item flex items-center py-2 px-3 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 last:border-b-0"
          >
            <div className={`website-status-indicator ${website.status === WEBSITE_STATUS.ACTIVE ? 'active' : 'inactive'}`}></div>
            <div className="website-details flex-1 overflow-hidden">
              <div className="website-name text-sm font-medium">{website.name}</div>
              <a
                href={website.url}
                target="_blank"
                rel="noopener noreferrer"
                className="website-url text-xs text-gray-500 truncate hover:text-blue-500"
              >
                {website.url}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WebsiteList;
