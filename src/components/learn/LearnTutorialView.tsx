import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { Card } from '@/components/common/Card';
import { GeometryShapeDiagram } from '@/components/learn/GeometryShapeDiagram';
import { TrigonometryShapeDiagram } from '@/components/learn/TrigonometryShapeDiagram';
import type { LearnFormulaRow, LearnTutorial } from '@/features/learn/learnTopics';
import { useAppTranslation } from '@/i18n/useAppTranslation';
import { spacing } from '@/theme/spacing';

type LearnTutorialViewProps = {
  tutorial: LearnTutorial;
  onTryInPractice?: () => void;
};

function isCompactFormulaRow(row: LearnFormulaRow): boolean {
  return (
    !row.shape &&
    !row.diagram &&
    !row.trigonometryDiagram &&
    !row.explanation &&
    !row.hint
  );
}

export function LearnTutorialView({ tutorial, onTryInPractice }: LearnTutorialViewProps) {
  const { t } = useAppTranslation('common');

  return (
    <View style={styles.root}>
      <AppText variant="title">{tutorial.title}</AppText>
      <AppText variant="body" muted>
        {tutorial.summary}
      </AppText>

      {tutorial.formula ? (
        <Card>
          <AppText variant="label" muted>
            {t('formula')}
          </AppText>
          <AppText variant="subtitle">{tutorial.formula}</AppText>
        </Card>
      ) : null}

      {tutorial.sections.map((section) => (
        <Card key={section.heading}>
          <AppText variant="subtitle">{section.heading}</AppText>
          <AppText variant="body">{section.body}</AppText>
        </Card>
      ))}

      {tutorial.examples && tutorial.examples.length > 0 ? (
        <Card>
          <AppText variant="subtitle">{t('examples')}</AppText>
          {tutorial.examples.map((ex) => (
            <View key={ex.prompt} style={styles.example}>
              <AppText variant="body">{ex.prompt}</AppText>
              <AppText variant="body" muted>
                → {ex.solution}
              </AppText>
            </View>
          ))}
        </Card>
      ) : null}

      {tutorial.formulaTables?.map((table) => (
        <Card key={table.heading}>
          <AppText variant="subtitle">{table.heading}</AppText>
          {table.intro ? (
            <AppText variant="body" muted style={styles.tableIntro}>
              {table.intro}
            </AppText>
          ) : null}
          <View style={styles.tableRows}>
            {table.rows.map((row, rowIndex) => {
              const compact = isCompactFormulaRow(row);
              return (
                <View
                  key={`${table.heading}-${rowIndex}`}
                  style={compact ? styles.formulaRowCompact : styles.formulaRow}
                >
                  {row.shape ? (
                    <AppText variant="label" style={styles.shapeName}>
                      {row.shape}
                    </AppText>
                  ) : null}
                  {row.diagram ? (
                    <GeometryShapeDiagram
                      measure={row.diagram.measure}
                      shape={row.diagram.shape}
                    />
                  ) : null}
                  {row.trigonometryDiagram ? (
                    <TrigonometryShapeDiagram diagram={row.trigonometryDiagram} />
                  ) : null}
                  <AppText
                    variant="body"
                    style={compact ? styles.formulaTextCompact : styles.formulaText}
                  >
                    {row.formula}
                  </AppText>
                  {row.explanation ? (
                    <AppText variant="body" muted style={styles.explanation}>
                      {row.explanation}
                    </AppText>
                  ) : null}
                  {row.hint ? (
                    <AppText variant="body" muted style={styles.formulaHint}>
                      {row.hint}
                    </AppText>
                  ) : null}
                </View>
              );
            })}
          </View>
        </Card>
      ))}

      {onTryInPractice ? (
        <AppButton label={t('tryInPractice')} onPress={onTryInPractice} variant="secondary" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
  example: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  tableIntro: {
    marginTop: spacing.xs,
  },
  tableRows: {
    marginTop: spacing.xs,
  },
  formulaRow: {
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.35)',
    gap: spacing.xs,
  },
  formulaRowCompact: {
    paddingVertical: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.35)',
    alignItems: 'center',
  },
  shapeName: {
    textTransform: 'capitalize',
  },
  formulaText: {
    fontWeight: '600',
  },
  formulaTextCompact: {
    fontWeight: '600',
    textAlign: 'center',
  },
  explanation: {
    lineHeight: 22,
  },
  formulaHint: {
    fontSize: 13,
    lineHeight: 18,
  },
});
