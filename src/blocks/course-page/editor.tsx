import {
	InnerBlocks,
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import {
	Button,
	CheckboxControl,
	PanelBody,
	PanelRow,
	TextControl,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { useState } from '@wordpress/element';
import { _x, __ } from '@wordpress/i18n';
import { trash } from '@wordpress/icons';
import { registerPlugin } from '@wordpress/plugins';

import { Attributes as DriveListAttributes } from '../drive-list/drive-list';

import CourseLinks from '../../components/course-links';
import SectionedPage from '../../components/sectioned-page';
import SVGImage from '../../components/svg-image';

import usePostMeta from '../../hooks/usePostMeta';
import {
	fmtCourseCode,
	fmtCourseCredits,
	fmtProgramsYears,
	fmtSPs,
} from '../../utils/format';
import {
	CoursePageMeta,
	Inline,
	PROGRAMS,
	STUDY_PERIODS,
	WPBlock,
	WPCoursePageMeta,
	YEARS,
} from '../../utils/types';

import CheckboxGroup from '../../components/checkbox-group';
import metadata from './block.json';

declare const ftekInline: Inline;

const icon = (
	<SVGImage
		url={ftekInline.assets.openBook}
		style={{ width: 24, height: 24, marginLeft: 12 }}
	/>
);

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
					label={__('Course code', 'ftek-plugin')}
					value={meta.code}
					onChange={(value) => updateMeta({ code: value })}
				/>
			</PanelRow>
			<PanelRow>
				<TextControl
					label={__('Credits', 'ftek-plugin')}
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
					label={__('Course homepage URL', 'ftek-plugin')}
					value={meta.homepage_url}
					onChange={(value) => updateMeta({ homepage_url: value })}
				/>
			</PanelRow>
			<PanelRow>
				<TextControl
					label={__('Course info URL', 'ftek-plugin')}
					value={meta.info_url}
					onChange={(value) => updateMeta({ info_url: value })}
				/>
			</PanelRow>
			<PanelRow>
				<TextControl
					label={__('Latest course survey URL', 'ftek-plugin')}
					value={meta.survey_url}
					onChange={(value) => updateMeta({ survey_url: value })}
				/>
			</PanelRow>
			<hr />
			<PanelRow>
				<div>
					<p>{__('Student representatives', 'ftek-plugin')}</p>
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
									label={__('Full Name', 'ftek-plugin')}
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
									label={_x(
										'CID',
										'Chalmers ID',
										'ftek-plugin'
									)}
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
						{_x('Add', 'student representative', 'ftek-plugin')}
					</Button>
				</div>
			</PanelRow>
			<hr />
			<PanelRow>
				<div>
					<p>{__('Study period', 'ftek-plugin')}</p>
					<CheckboxGroup
						boxes={STUDY_PERIODS.map((sp) => ({
							label: fmtSPs([sp]),
							value: sp,
						}))}
						values={meta.study_perionds}
						onChange={(value) => {
							updateMeta({ study_perionds: value });
						}}
					/>
				</div>
			</PanelRow>
			<hr />
			<PanelRow>
				<div>
					<CheckboxGroup
						boxes={YEARS.map((year) => ({
							label: fmtProgramsYears([], [year]),
							value: year,
						}))}
						values={meta.years}
						onChange={(value) => updateMeta({ years: value })}
					/>
				</div>
			</PanelRow>
			<hr />
			<PanelRow>
				<div>
					<p>{__('Progammes', 'ftek-plugin')}</p>
					<CheckboxGroup
						boxes={PROGRAMS.map((program) => ({
							label: program,
							value: program,
						}))}
						values={meta.programs}
						onChange={(value) => updateMeta({ programs: value })}
					/>
				</div>
			</PanelRow>
			<hr />
			<PanelRow>
				<TextControl
					label={__(
						'Approximate number of participants',
						'ftek-plugin'
					)}
					help={__('Used for sorting courses', 'ftek-plugin')}
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
					label={__('Elective course', 'ftek-plugin')}
					checked={meta.elective}
					onChange={(checked) => updateMeta({ elective: checked })}
				/>
			</PanelRow>
			<PanelRow>
				<TextControl
					label={__('Comment', 'ftek-plugin')}
					help={__(
						'Shown as footnote in course table',
						'ftek-plugin'
					)}
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
			)} | ${fmtProgramsYears(meta.programs, meta.years)} | ${fmtSPs(
				meta.study_perionds
			)}`}</h2>
			<SectionedPage>
				<SectionedPage.Main>{children}</SectionedPage.Main>
				<SectionedPage.Aside>
					<CourseLinks
						header={<h3>{__('Links', 'ftek-plugin')}</h3>}
						meta={meta}
					/>
					{studentRepresentatives.length > 0 && (
						<>
							<h3>
								{__('Student Representatives', 'ftek-plugin')}
							</h3>
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
					<h3>{__('Is Anything Missing?', 'ftek-plugin')}</h3>
					<span
						dangerouslySetInnerHTML={{
							// translators: %1$s Anchor attributes
							__html: __(
								'Contact <a %1$s>SNF</a>.',
								'ftek-plugin'
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
	// This is a hack which forces the template to appear valid.
	// See https://github.com/WordPress/gutenberg/issues/11681
	useDispatch('core/block-editor').setTemplateValidity(true);

	const hasDriveList = !!useSelect(
		(select) =>
			select('core/blocks').getBlockType('ftek-plugin/drive-list'),
		[]
	);
	const innerBlocksTemplate: WPBlock[] = [
		[
			'core/heading',
			{ content: __('Description', 'ftek-plugin'), level: 3 },
		],
		[
			'core/paragraph',
			{
				placeholder: __('Description goes here.', 'ftek-plugin'),
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
								'ftek-plugin'
							),
							level: 3,
						},
					],
					[
						'ftek-plugin/drive-list',
						{
							depth: 2,
							download: true,
							collapsible: true,
						} as Partial<DriveListAttributes>,
					],
			  ] as WPBlock[])
			: []),
	];

	const updateAttributes = (m: Partial<CoursePageMeta>) =>
		setAttributes({ ...meta, ...m });

	const maybeMeta = usePostMeta<CoursePageMeta, WPCoursePageMeta>(
		'ftek_plugin_course_page_meta',
		'course-page'
	);
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
					title={__('Course page', 'ftek-plugin')}
					initialOpen={true}
					icon={icon}
				>
					<Controls meta={meta} updateMeta={updateMeta} />
				</PanelBody>
			</InspectorControls>
			<CoursePage meta={meta}>
				<InnerBlocks
					template={innerBlocksTemplate}
					templateLock={false}
				/>
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
	const maybeMeta = usePostMeta<CoursePageMeta, WPCoursePageMeta>(
		'ftek_plugin_course_page_meta',
		'course-page'
	);
	if (!maybeMeta) {
		return <></>;
	}
	const [meta, updateMeta] = maybeMeta;

	return (
		<PluginDocumentSettingPanel
			title={__('Course page', 'ftek-plugin')}
			opened={true}
			icon={icon}
		>
			<Controls meta={meta} updateMeta={updateMeta} />
		</PluginDocumentSettingPanel>
	);
};

registerPlugin('couse-page', {
	render: DocumentSettings,
	icon,
});

registerBlockType(metadata, {
	edit: Edit,
	save: Save,
	icon,
});
