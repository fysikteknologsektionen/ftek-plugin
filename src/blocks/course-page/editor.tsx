import { registerBlockType } from '@wordpress/blocks';
import {
	useBlockProps,
	InnerBlocks,
	InspectorControls,
} from '@wordpress/block-editor';
import { useEntityProp } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import {
	PanelBody,
	PanelRow,
	TextControl,
	Button,
	CheckboxControl,
	RadioControl,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { trash } from '@wordpress/icons';
import { __, _x } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';

import SVGImage from '../../components/svg-image';
import SectionedPage from '../../components/sectioned-page';

import {
	fmtCourseCode,
	fmtCourseCredits,
	fmtProgramsYear,
	fmtSPs,
	fmtYear,
} from '../../utils/format';
import {
	CoursePageMeta,
	Inline,
	Program,
	PROGRAMS,
	StudyPeriod,
	STUDY_PERIODS,
	WPBlock,
	WPCoursePageMeta,
	Year,
	YEARS,
} from '../../utils/types';

import metadata from './block.json';
import CourseLinks from '../../components/course-links';

declare const ftekInline: Inline;

const icon = (
	<SVGImage
		url={ftekInline.assets.openBook}
		style={{ width: 24, height: 24, marginLeft: 12 }}
	/>
);

const useMeta = ():
	| false
	| [CoursePageMeta, (m: Partial<CoursePageMeta>) => void] => {
	const postType = useSelect(
		(select) => select('core/editor').getCurrentPostType(),
		[]
	);
	const [wpCoursePageMeta, setWpCoursePageMeta]: [
		WPCoursePageMeta,
		(m: WPCoursePageMeta) => void
	] = useEntityProp('postType', postType, 'meta');

	if (postType !== 'course-page') {
		return false;
	}

	const meta = wpCoursePageMeta.ftek_course_page_meta;
	const updateMeta = (m: Partial<CoursePageMeta>) =>
		setWpCoursePageMeta({ ftek_course_page_meta: { ...meta, ...m } });

	return [meta, updateMeta];
};

const Controls = ({
	meta,
	updateMeta,
}: {
	meta: CoursePageMeta;
	updateMeta: (m: Partial<CoursePageMeta>) => void;
}) => {
	const [creditsText, setCreditsText] = useState<string>(null);
	const [participantCountText, setParticipantCountText] =
		useState<string>(null);

	return (
		<>
			<PanelRow>
				<TextControl
					label={__('Course code', 'ftek')}
					value={meta.code}
					onChange={(value) => updateMeta({ code: value })}
				/>
			</PanelRow>
			<PanelRow>
				<TextControl
					label={__('Credits', 'ftek')}
					value={creditsText !== null ? creditsText : meta.credits}
					onChange={(value: string) => {
						setCreditsText(value);
						const numeric = Number(value);
						if (Number.isFinite(numeric) && numeric >= 0) {
							updateMeta({ credits: numeric });
						}
					}}
				/>
			</PanelRow>
			<hr />
			<PanelRow>
				<TextControl
					label={__('Course homepage URL', 'ftek')}
					value={meta.homepage_url}
					onChange={(value) => updateMeta({ homepage_url: value })}
				/>
			</PanelRow>
			<PanelRow>
				<TextControl
					label={__('Course info URL', 'ftek')}
					value={meta.info_url}
					onChange={(value) => updateMeta({ info_url: value })}
				/>
			</PanelRow>
			<PanelRow>
				<TextControl
					label={__('Latest course survey URL', 'ftek')}
					value={meta.survey_url}
					onChange={(value) => updateMeta({ survey_url: value })}
				/>
			</PanelRow>
			<hr />
			<PanelRow>
				<div>
					<p>{__('Student representatives', 'ftek')}</p>
					{meta.student_representatives.map((representative, i) => (
						<div
							key={i}
							style={{
								display: 'flex',
								alignItems: 'center',
								marginBottom: '1rem',
							}}
						>
							<Button
								icon={trash}
								onClick={() => {
									const repr = [
										...meta.student_representatives,
									];
									repr.splice(i, 1);
									updateMeta({
										student_representatives: repr,
									});
								}}
							/>
							<div style={{ padding: '0.5rem' }}>
								<TextControl
									label={__('Full Name', 'ftek')}
									value={representative.name}
									onChange={(value) => {
										const repr = [
											...meta.student_representatives,
										];
										repr[i] = {
											...representative,
											name: value,
										};
										updateMeta({
											student_representatives: repr,
										});
									}}
								/>
								<TextControl
									label={_x('CID', 'Chalmers ID', 'ftek')}
									value={representative.cid}
									onChange={(value) => {
										const repr = [
											...meta.student_representatives,
										];
										repr[i] = {
											...representative,
											cid: value,
										};
										updateMeta({
											student_representatives: repr,
										});
									}}
								/>
							</div>
						</div>
					))}
					<Button
						onClick={() =>
							updateMeta({
								student_representatives: [
									...meta.student_representatives,
									{ name: '', cid: '' },
								],
							})
						}
						variant="secondary"
					>
						{_x('Add', 'student representative', 'ftek')}
					</Button>
				</div>
			</PanelRow>
			<hr />
			<PanelRow>
				<div>
					<p>{__('Study period', 'ftek')}</p>
					{STUDY_PERIODS.map((sp, i) => (
						<CheckboxControl
							key={i}
							label={fmtSPs([sp])}
							checked={meta.study_perionds.includes(sp)}
							onChange={() => {
								const sps = [...meta.study_perionds];
								const index = sps.indexOf(sp);
								if (index >= 0) {
									sps.splice(index, 1);
								} else {
									sps.push(sp);
								}
								updateMeta({
									study_perionds: sps,
								});
							}}
						/>
					))}
				</div>
			</PanelRow>
			<hr />
			<PanelRow>
				<RadioControl
					label={_x('Year', 'grade', 'ftek')}
					selected={meta.year}
					options={YEARS.map((year) => ({
						label: fmtYear(year),
						value: year,
					}))}
					onChange={(value: Year) => updateMeta({ year: value })}
				/>
			</PanelRow>
			<hr />
			<PanelRow>
				<div>
					<p>{__('Progammes', 'ftek')}</p>
					{PROGRAMS.map((program, i) => (
						<CheckboxControl
							key={i}
							label={program}
							checked={meta.programs.includes(program)}
							onChange={() => {
								const prgs = [...meta.programs];
								const index = prgs.indexOf(program);
								if (index >= 0) {
									prgs.splice(index, 1);
								} else {
									prgs.push(program);
								}
								updateMeta({ programs: prgs });
							}}
						/>
					))}
				</div>
			</PanelRow>
			<hr />
			<PanelRow>
				<TextControl
					label={__('Approximate number of participants', 'ftek')}
					help={__('Used for sorting courses', 'ftek')}
					value={
						participantCountText !== null
							? participantCountText
							: meta.participant_count
					}
					onChange={(value) => {
						setParticipantCountText(value);
						const numeric = Number(value);
						if (Number.isFinite(numeric) && numeric >= 0) {
							updateMeta({ participant_count: numeric });
						}
					}}
				/>
			</PanelRow>
			<PanelRow>
				<CheckboxControl
					label={__('Elective course', 'ftek')}
					checked={meta.elective}
					onChange={(checked) => updateMeta({ elective: checked })}
				/>
			</PanelRow>
			<PanelRow>
				<TextControl
					label={__('Comment', 'ftek')}
					help={__('Shown as footnote in course table', 'ftek')}
					value={meta.comment}
					onChange={(value) => updateMeta({ comment: value })}
				/>
			</PanelRow>
		</>
	);
};

const CoursePage = ({
	meta,
	children,
}: {
	meta: CoursePageMeta;
	children: React.ReactNode;
}): JSX.Element => {
	const studentRepresentatives = meta.student_representatives.filter(
		(representative) => representative.name || representative.cid
	);

	return (
		<>
			<h2>{`${fmtCourseCode(meta.code)} | ${fmtCourseCredits(
				meta.credits
			)} | ${fmtProgramsYear(meta.programs, meta.year)} | ${fmtSPs(
				meta.study_perionds
			)}`}</h2>
			<SectionedPage>
				<SectionedPage.Main>{children}</SectionedPage.Main>
				<SectionedPage.Aside>
					<CourseLinks
						header={<h3>{__('Links', 'ftek')}</h3>}
						meta={meta}
					/>
					{studentRepresentatives.length > 0 && (
						<>
							<h3>{__('Student Representatives', 'ftek')}</h3>
							<ul>
								{studentRepresentatives.map((repr, i) => {
									const name = repr.name || repr.cid;
									return (
										<li key={i}>
											{repr.cid ? (
												<a
													href={`mailto:${repr.cid}@student.chalmers.se`}
												>
													{name}
												</a>
											) : (
												name
											)}
										</li>
									);
								})}
							</ul>
						</>
					)}
					<h3>{__('Is Anything Missing?', 'ftek')}</h3>
					<span
						dangerouslySetInnerHTML={{
							// translators: %1$s Anchor attributes
							__html: __(
								'Contact <a %1$s>SNF</a>.',
								'ftek'
							).replace('%1$s', 'href="mailto:snf@ftek.se"'),
						}}
					/>
				</SectionedPage.Aside>
			</SectionedPage>
		</>
	);
};

const Edit = ({
	attributes,
	setAttributes,
}: {
	attributes: CoursePageMeta;
	setAttributes: (m: CoursePageMeta) => void;
}): JSX.Element => {
	const hasDriveList = !!useSelect(
		(select) => select('core/blocks').getBlockType('ftek/drive-list'),
		[]
	);
	const innerBlocksTemplate: WPBlock[] = [
		['core/heading', { content: __('Description', 'ftek'), level: 3 }],
		[
			'core/paragraph',
			{
				placeholder: __('Description goes here.', 'ftek'),
			},
		],
		...(hasDriveList
			? ([
					[
						'core/heading',
						{
							content: _x(
								'Documents',
								'drive list heading',
								'ftek'
							),
							level: 3,
						},
					],
					[
						'ftek/drive-list',
						{
							depth: 2,
							download: true,
						},
					],
			  ] as WPBlock[])
			: []),
	];

	const updateAttributes = (m: Partial<CoursePageMeta>) =>
		setAttributes({ ...meta, ...m });

	const maybeMeta = useMeta();
	const [meta, updateMeta] = maybeMeta
		? maybeMeta
		: [attributes, updateAttributes];

	if (maybeMeta) {
		setAttributes(meta);
	}

	return (
		<div {...useBlockProps()}>
			<InspectorControls>
				<PanelBody
					title={__('Course Page', 'ftek')}
					initialOpen={true}
					icon={
						<SVGImage
							url={ftekInline.assets.openBook}
							style={{ width: 24, height: 24, marginLeft: 12 }}
						/>
					}
				>
					<Controls meta={meta} updateMeta={updateMeta} />
				</PanelBody>
			</InspectorControls>
			<CoursePage meta={meta}>
				<InnerBlocks template={innerBlocksTemplate} />
			</CoursePage>
		</div>
	);
};

const Save = ({ attributes }: { attributes: CoursePageMeta }): JSX.Element => (
	<div {...useBlockProps.save()}>
		<CoursePage meta={attributes}>
			<InnerBlocks.Content />
		</CoursePage>
	</div>
);

const DocumentSettings = () => {
	const maybeMeta = useMeta();
	if (!maybeMeta) {
		return <></>;
	}
	const [meta, updateMeta] = maybeMeta;

	return (
		<PluginDocumentSettingPanel
			title={__('Course Page', 'ftek')}
			opened={true}
			icon={icon}
		>
			<Controls meta={meta} updateMeta={updateMeta} />
		</PluginDocumentSettingPanel>
	);
};

registerPlugin('ftek-monoplugin', {
	render: DocumentSettings,
	icon,
});

registerBlockType(metadata, {
	edit: Edit,
	save: Save,
	icon,
});