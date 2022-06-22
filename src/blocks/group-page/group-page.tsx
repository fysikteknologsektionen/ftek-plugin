import { InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { useEffect, useState } from '@wordpress/element';

import { GroupPageMeta, WPBlock, WPPost, WPTag } from '../../utils/types';

import SectionedPage from '../../components/sectioned-page';

const LoadingPosts = ({
	heading,
}: {
	heading: React.ReactNode;
}): JSX.Element => (
	<>
		{heading}
		<p>{__('Loading…', 'ftek')}</p>
	</>
);

const PostsByTag = ({
	heading,
	postType,
	tagId,
	limit = 100,
}: {
	heading: React.ReactNode;
	postType: string;
	tagId: number;
	limit?: number;
}): JSX.Element => {
	const [posts, setPosts] = useState<WPPost[]>(null);
	const [tag, setTag] = useState<WPTag>(null);

	useEffect(() => {
		apiFetch<WPPost[]>({
			path: `/wp/v2/${postType}?tags=${tagId}&per_page=${limit}`,
		}).then(setPosts);

		apiFetch<WPTag>({
			path: `/wp/v2/tags/${tagId}`,
		}).then(setTag);
	}, []);

	if (!posts) {
		return <LoadingPosts heading={heading} />;
	}

	if (posts.length === 0) {
		return <></>;
	}

	return (
		<>
			{heading}
			<ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
				{posts.map((post, i) => (
					<li key={i}>
						<a href={post.link}>{post.title.rendered}</a>
					</li>
				))}
			</ul>
			{tag && tag.count > limit && (
				<p>
					<a href={tag.link}>{__('More…', 'ftek')}</a>
				</p>
			)}
		</>
	);
};

export const AsideDynamicArea = ({
	attributes,
	save = false,
}: {
	attributes: GroupPageMeta;
	save?: boolean;
}): JSX.Element => {
	const relatedPages = <h3>{__('Related pages', 'ftek')}</h3>;
	const latestPosts = <h3>{__('Latest posts', 'ftek')}</h3>;

	if (attributes.group_tag_id <= 0) {
		return <></>;
	}

	return (
		<>
			{save ? (
				<LoadingPosts heading={relatedPages} />
			) : (
				<PostsByTag
					heading={relatedPages}
					postType="pages"
					tagId={attributes.group_tag_id}
				/>
			)}
			{save ? (
				<LoadingPosts heading={latestPosts} />
			) : (
				<PostsByTag
					heading={latestPosts}
					postType="posts"
					tagId={attributes.group_tag_id}
					limit={4}
				/>
			)}
		</>
	);
};

export const GroupPage = ({
	attributes,
	save = false,
}: {
	attributes: GroupPageMeta;
	save?: boolean;
}): JSX.Element => {
	const innerBlocksTemplate: WPBlock[] = [
		['core/heading', { content: __('Description', 'ftek'), level: 3 }],
		[
			'core/paragraph',
			{
				placeholder: __('Description goes here.', 'ftek'),
			},
		],
	];

	return (
		<SectionedPage>
			<SectionedPage.Main>
				{save ? (
					<InnerBlocks.Content />
				) : (
					<InnerBlocks
						template={innerBlocksTemplate}
						templateLock={false}
					/>
				)}
			</SectionedPage.Main>
			<SectionedPage.Aside>
				{attributes.logo_url && (
					<div>
						<img
							style={{ width: '100%' }}
							alt={__('Logo', 'ftek')}
							src={attributes.logo_url}
						/>
					</div>
				)}
				<div className="aside-dynamic-area">
					<AsideDynamicArea attributes={attributes} save={save} />
				</div>
			</SectionedPage.Aside>
		</SectionedPage>
	);
};

GroupPage.Loading = ({
	attributes,
}: {
	attributes: GroupPageMeta;
}): JSX.Element => <GroupPage attributes={attributes} save={true} />;