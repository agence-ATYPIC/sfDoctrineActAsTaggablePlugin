<?php

class generateTagsTask extends sfBaseTask
{
  protected function configure()
  {
    // // add your own arguments here
    // $this->addArguments(array(
    //   new sfCommandArgument('my_arg', sfCommandArgument::REQUIRED, 'My argument'),
    // ));

    $this->addOptions(array(
      new sfCommandOption('application', null, sfCommandOption::PARAMETER_REQUIRED, 'The application name'),
      new sfCommandOption('env', null, sfCommandOption::PARAMETER_REQUIRED, 'The environment', 'dev'),
      new sfCommandOption('connection', null, sfCommandOption::PARAMETER_REQUIRED, 'The connection name', 'doctrine'),
      // add your own options here
      new sfCommandOption('n', null, sfCommandOption::PARAMETER_REQUIRED, 'The number of tags to generate', 10),
      new sfCommandOption('models', null, sfCommandOption::PARAMETER_OPTIONAL, 'The models to tag'),
    ));

    $this->namespace        = 'generate';
    $this->name             = 'tags';
    $this->briefDescription = '';
    $this->detailedDescription = <<<EOF
The [generate:tags|INFO] task does things.
Call it with:

  [php symfony generate:tags|INFO]
EOF;
  }

  protected function execute($arguments = array(), $options = array())
  {
    // initialize the database connection
    $databaseManager = new sfDatabaseManager($this->configuration);
    $connection = $databaseManager->getDatabase($options['connection'])->getConnection();

    // add your code here
    $n = $options['n'];

    $tags = $this->createTags($n);

    if (!empty($options['models']))
    {
      $modelClasses = explode(',', $options['models']);

      foreach($modelClasses as $class)
      {
        try
        {
          $models = Doctrine::getTable($class)->createQuery()->execute();

          foreach($models as $model)
          {
            $model->addTag($tags[rand(0, $n - 1)]);
            $model->save();
          }
        }
        catch (Exception $e)
        {
          echo $e->getMessage() . "\n";
        }
      }
    }
  }

  public function createTags($n)
  {
    $dict = file(sfConfig::get('sf_plugins_dir') . '/sfDoctrineActAsTaggablePlugin/data/words.txt');
    $tags = array();

    while (count($tags) < $n)
    {
      $word = $dict[rand(0, count($dict) - 1)];

      $tags[$word] = $word;
    }

    $tags = array_values($tags);

    return $tags;
  }
}
