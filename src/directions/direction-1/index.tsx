import { Button, Card, Stack, Typography } from "@getathelas/ui";
import { PageLayout } from "../../shell/PageLayout";
import { patients } from "../../mock/patients";

// Your prototype starts here. Ask the agent to replace this screen
// with your design, for example by sharing a Figma frame link.
export function Direction1() {
  return (
    <PageLayout
      title="Today's patients"
      description="Sample screen built with DS3.0. Replace it with your design."
      actions={
        <Stack direction="horizontal" gap={2}>
          <Button variant="secondary">Export list</Button>
          <Button variant="primary">Add patient</Button>
        </Stack>
      }
    >
      <Card>
        <Stack direction="vertical" gap={4}>
          {patients.map((patient) => (
            <Stack key={patient.id} direction="horizontal" align="center" gap={4}>
              <Stack direction="vertical" gap={1}>
                <Typography variant="label-m">
                  {patient.name}, {patient.age}
                </Typography>
                <Typography variant="body-s" color="fg-secondary">
                  {patient.reason}
                </Typography>
              </Stack>
              <Stack.Item grow />
              <Typography variant="body-s" color="fg-secondary">
                {patient.status}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Card>
    </PageLayout>
  );
}
