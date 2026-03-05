'use client';

import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  PiXBold,
} from 'react-icons/pi';
import { ActionIcon, Text, Title } from 'rizzui';

type WebsiteInfoProps = {
  title?: string;
};

export default function WebsiteInfo(props: Readonly<WebsiteInfoProps>) {
  const { title } = props;
  const { closeModal } = useModal();

  return (
    <div className="m-auto px-5 pb-8 pt-5 @lg:pt-6 @2xl:px-7">
      <div className="mb-6 flex items-center justify-between">
        <Title as="h3" className="text-lg">
          {title}
        </Title>
        <ActionIcon
          size="sm"
          variant="text"
          onClick={() => closeModal()}
          className="p-0 text-gray-500 hover:!text-gray-900"
        >
          <PiXBold className="h-[18px] w-[18px]" />
        </ActionIcon>
      </div>
      <div>
        <Text>This website is fake</Text>
      </div>
    </div>
  );
}


